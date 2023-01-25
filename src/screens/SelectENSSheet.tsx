import { useRoute } from '@react-navigation/core';
import lang from 'i18n-js';
import React, { useCallback, useMemo } from 'react';
import { FlatList } from 'react-native-gesture-handler';
import ButtonPressAnimation from '../components/animations/ButtonPressAnimation';
import { Sheet } from '../components/sheet';
import { abbreviateEnsForDisplay } from '@/utils/abbreviations';
import {
  AccentColorProvider,
  Bleed,
  Box,
  Heading,
  Inline,
  Inset,
  Stack,
  Text,
  useForegroundColor,
} from '@/design-system';
import {
  prefetchENSAvatar,
  prefetchENSCover,
  prefetchENSRecords,
  useAccountENSDomains,
  useENSAvatar,
} from '@/hooks';
import { ImgixImage } from '@/components/images';
import { useNavigation } from '@/navigation';
import { useTheme } from '@/theme';
import { deviceUtils } from '@/utils';

export const SelectENSSheetHeight = 400;

const deviceHeight = deviceUtils.dimensions.height;
const rowHeight = 40;
const rowPadding = 19;
const maxListHeight = deviceHeight - 220;

export default function SelectENSSheet() {
  const {
    isSuccess,
    nonPrimaryDomains,
    primaryDomain,
  } = useAccountENSDomains();

  const secondary06 = useForegroundColor('secondary06 (Deprecated)');

  const { goBack } = useNavigation();
  const { params } = useRoute<any>();

  const handleSelectENS = useCallback(
    ensName => {
      prefetchENSAvatar(ensName);
      prefetchENSCover(ensName);
      prefetchENSRecords(ensName);
      goBack();
      params?.onSelectENS(ensName);
    },
    [goBack, params]
  );

  const controlledDomains = useMemo(() => {
    const sortedNonPrimaryDomains = nonPrimaryDomains?.sort((a, b) => {
      if (a.name && b.name) return a.name > b.name ? 1 : -1;
      return 1;
    });

    if (primaryDomain) sortedNonPrimaryDomains.unshift(primaryDomain);

    return sortedNonPrimaryDomains;
  }, [primaryDomain, nonPrimaryDomains]);

  let listHeight =
    (rowHeight + rowPadding) * (controlledDomains?.length || 0) + 21;
  let scrollEnabled = false;
  if (listHeight > maxListHeight) {
    listHeight = maxListHeight;
    scrollEnabled = true;
  }

  const renderItem = useCallback(
    ({ item }) => {
      return (
        <ButtonPressAnimation
          onPress={() => handleSelectENS(item.name)}
          scaleTo={0.95}
        >
          <Inline alignHorizontal="justify" alignVertical="center" wrap={false}>
            <Inline alignVertical="center" wrap={false}>
              <AccentColorProvider color={secondary06}>
                <Box
                  alignItems="center"
                  background="accent"
                  borderRadius={rowHeight / 2}
                  height={rowHeight}
                  justifyContent="center"
                  width={rowHeight}
                >
                  <ENSAvatar name={item.name} />
                </Box>
                <Box paddingLeft={10}>
                  <Text
                    numberOfLines={1}
                    color="primary (Deprecated)"
                    size="16px / 22px (Deprecated)"
                    weight="bold"
                  >
                    {abbreviateEnsForDisplay(item.name, 25)}
                  </Text>
                </Box>
              </AccentColorProvider>
            </Inline>
          </Inline>
        </ButtonPressAnimation>
      );
    },
    [handleSelectENS, secondary06]
  );

  return (
    // @ts-expect-error JavaScript component
    <Sheet>
      <Inset top={6}>
        <Stack space={24}>
          <Heading
            align="center"
            color="primary (Deprecated)"
            size="18px / 21px (Deprecated)"
            weight="heavy"
          >
            {lang.t('profiles.select_ens_name')}
          </Heading>
          {isSuccess && (
            <Bleed bottom={scrollEnabled ? 34 : 26}>
              <Box
                ItemSeparatorComponent={() => <Box height={rowPadding} />}
                as={FlatList}
                contentContainerStyle={{
                  paddingBottom: 50,
                  paddingHorizontal: 19,
                }}
                data={controlledDomains}
                height={listHeight}
                initialNumToRender={15}
                keyExtractor={({ domain }: { domain: string }) => domain}
                maxToRenderPerBatch={10}
                renderItem={renderItem}
                scrollEnabled={scrollEnabled}
                showsVerticalScrollIndicator={false}
              />
            </Bleed>
          )}
        </Stack>
      </Inset>
    </Sheet>
  );
}

function ENSAvatar({ name }: { name: string }) {
  const { colors } = useTheme();

  const { data: avatar } = useENSAvatar(name);

  if (avatar?.imageUrl) {
    return (
      <Box
        as={ImgixImage}
        borderRadius={rowHeight / 2}
        height={rowHeight}
        source={{ uri: avatar?.imageUrl }}
        width={rowHeight}
      />
    );
  }

  return (
    <AccentColorProvider color={colors.blueGreyDark30}>
      <Text
        align="right"
        color="accent"
        size="20px / 24px (Deprecated)"
        weight="bold"
      >
        􀉭
      </Text>
    </AccentColorProvider>
  );
}
