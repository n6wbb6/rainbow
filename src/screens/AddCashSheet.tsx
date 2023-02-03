import React from 'react';
import { getStatusBarHeight } from 'react-native-iphone-x-helper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RatioComponent } from '@ratio.me/ratio-react-native-library';
import { gretch } from 'gretchen';
import { useSelector } from 'react-redux';
import { nanoid } from 'nanoid/non-secure';

import { SheetHandle } from '../components/sheet';
import { deviceUtils } from '../utils';
import { useDimensions } from '@/hooks';
import { borders } from '@/styles';
import { IS_IOS } from '@/env';
import { Box, Text, Stack, Inline } from '@/design-system';
import { AppState } from '../redux/store';
import { loadWallet, signPersonalMessage } from '@/model/wallet';
import { Ratio } from '@/components/icons/svg/Ratio';
import { WrappedAlert } from '@/helpers/alert';
import { logger, RainbowError } from '@/logger';
import * as lang from '@/languages';
import { analyticsV2 } from '@/analytics';

const deviceHeight = deviceUtils.dimensions.height;
const statusBarHeight = getStatusBarHeight(true);
const sheetHeight =
  deviceHeight -
  statusBarHeight -
  (IS_IOS ? (deviceHeight >= 812 ? 10 : 20) : 0);

function RatioButton({ accountAddress }: { accountAddress: string }) {
  // TODO
  const [isLoading, setIsLoading] = React.useState(false);
  const sessionId = React.useMemo(() => nanoid(), []);

  return (
    <RatioComponent
      fetchSessionToken={async () => {
        logger.debug(`Ratio: fetchSessionToken`, {}, logger.DebugContext.f2c);

        const { data, error } = await gretch<{ id: string }>(
          'https://f2c.rainbow.me/v1/ratio/client-session',
          {
            method: 'POST',
            json: {
              signingAddress: accountAddress,
              depositAddress: accountAddress,
              signingNetwork: 'ETHEREUM',
            },
          }
        ).json();

        if (!data || error) {
          throw new Error(error);
        }

        return data?.id;
      }}
      signingCallback={async challenge => {
        logger.debug(`Ratio: signingCallback`, {}, logger.DebugContext.f2c);

        const existingWallet = await loadWallet(accountAddress, true);

        if (!existingWallet) {
          throw new Error('No wallet found');
        }

        const { result, error } =
          (await signPersonalMessage(challenge, existingWallet)) || {};

        if (!result || error) {
          throw new Error('Signature failed');
        }

        return { signature: result };
      }}
      onPress={() => {
        setIsLoading(true);
        logger.debug(`Ratio: clicked`, {}, logger.DebugContext.f2c);
        analyticsV2.track(analyticsV2.event.f2cProviderFlowStarted, {
          provider: 'ratio',
          sessionId,
        });
      }}
      onOpen={() => {
        logger.debug(`Ratio: opened`, {}, logger.DebugContext.f2c);
      }}
      onTransactionComplete={order => {
        logger.debug(
          `Ratio: transaction complete`,
          { order },
          logger.DebugContext.f2c
        );
        analyticsV2.track(analyticsV2.event.f2cProviderFlowCompleted, {
          provider: 'ratio',
          sessionId,
        });
      }}
      onHelp={() => {
        logger.debug(`Ratio: help clicked`, {}, logger.DebugContext.f2c);
      }}
      onAccountRecovery={() => {
        logger.debug(
          `Ratio: account recovery clicked`,
          {},
          logger.DebugContext.f2c
        );
      }}
      onError={error => {
        logger.error(
          new RainbowError(`Ratio component threw an error: ${error}`),
          { error }
        );
        analyticsV2.track(analyticsV2.event.f2cProviderFlowErrored, {
          provider: 'ratio',
          sessionId,
        });
        WrappedAlert.alert(
          lang.t(lang.l.wallet.add_cash_v2.generic_error.title),
          lang.t(lang.l.wallet.add_cash_v2.generic_error.message),
          [
            {
              text: lang.t(lang.l.wallet.add_cash_v2.generic_error.button),
            },
          ]
        );
      }}
      onClose={() => {
        logger.debug(`Ratio: closed`, {}, logger.DebugContext.f2c);
      }}
    >
      <Box
        background="surfaceSecondaryElevated"
        padding="20px"
        borderRadius={20}
        shadow="12px"
        position="absolute"
        width="full"
      >
        <Inline alignVertical="center">
          <Box
            borderRadius={24}
            height={{ custom: 24 }}
            width={{ custom: 24 }}
            style={{ backgroundColor: 'black' }}
            alignItems="center"
            justifyContent="center"
          >
            <Ratio width={14} height={14} color="white" />
          </Box>
          <Box paddingLeft="10px">
            <Text size="13pt" weight="bold" color="label">
              Ratio
            </Text>
          </Box>
        </Inline>

        <Box paddingTop="12px" paddingBottom="12px">
          <Text size="20pt" weight="heavy" color="label">
            Buy with a Bank Account
          </Text>
        </Box>
        <Box paddingBottom="28px">
          <Text size="15pt" weight="regular" color="labelSecondary">
            Works with any bank account.
          </Text>
        </Box>

        <Inline alignVertical="center">
          <Box borderRadius={8} padding="6px" background="fillSecondary">
            <Text size="12pt" weight="bold" color="labelSecondary">
              2.9% fee
            </Text>
          </Box>
          <Box paddingLeft="10px">
            <Text size="12pt" weight="semibold" color="labelSecondary">
              􀋦 Instant with Apple Pay
            </Text>
          </Box>
        </Inline>
      </Box>
    </RatioComponent>
  );
}

export default function AddCashSheet() {
  const { isNarrowPhone } = useDimensions();
  const insets = useSafeAreaInsets();
  const { accountAddress } = useSelector(({ settings }: AppState) => ({
    accountAddress: settings.accountAddress,
  }));

  return (
    <Box
      background="surfaceSecondary"
      height={{ custom: IS_IOS ? deviceHeight : sheetHeight }}
      top={{ custom: IS_IOS ? 0 : statusBarHeight }}
      width="full"
      style={{
        ...borders.buildRadiusAsObject('top', IS_IOS ? 0 : 16),
      }}
    >
      <Box
        height="full"
        paddingBottom={{ custom: isNarrowPhone ? 15 : insets.bottom + 11 }}
        paddingHorizontal="20px"
      >
        <Stack alignHorizontal="center">
          <Box paddingTop="8px" paddingBottom="44px">
            <SheetHandle showBlur={undefined} />
          </Box>

          <Box paddingBottom="20px">
            <Text size="30pt" weight="heavy" color="label">
              Get Crypto
            </Text>
          </Box>
          <Text
            size="17pt"
            weight="regular"
            color="labelTertiary"
            align="center"
          >
            Converting cash to crypto is easy! Choose a method below to get
            started.
          </Text>
        </Stack>
        <Box paddingVertical="44px">
          <RatioButton accountAddress={accountAddress} />
        </Box>
      </Box>
    </Box>
  );
}
