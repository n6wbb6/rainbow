import React from 'react';
import { Box, Column, Columns, Inline, Stack, Text } from '@/design-system';
import ImageAvatar from '@/components/contacts/ImageAvatar';
import { RANK_SYMBOLS } from '@/screens/rewards/constants';
import {
  addressHashedColorIndex,
  addressHashedEmoji,
} from '@/utils/profileUtils';
import { ContactAvatar } from '@/components/contacts';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { StyleSheet } from 'react-native';
import { getGradientColorsForRank } from '@/screens/rewards/helpers/getGradientColorsForRank';
import { useTheme } from '@/theme';
import { useNavigation } from '@/navigation';
import Routes from '@/navigation/routesNames';
import { ButtonPressAnimation } from '@/components/animations';
import { formatTokenDisplayValue } from '@/screens/rewards/helpers/formatTokenDisplayValue';

const MaskedGradientText: React.FC<{
  text: string;
  gradientColors: string[];
}> = ({ text, gradientColors }) => {
  return (
    <Box>
      <MaskedView
        maskElement={
          <Box>
            <Text size="13pt" color="label" weight="bold">
              {text}
            </Text>
          </Box>
        }
      >
        <Box style={{ opacity: 0 }}>
          <Text size="13pt" color="label" weight="bold">
            {text}
          </Text>
        </Box>
        <LinearGradient
          colors={gradientColors}
          end={{ x: 1, y: 1 }}
          pointerEvents="none"
          start={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </MaskedView>
    </Box>
  );
};

type Props = {
  rank: number;
  avatarUrl?: string;
  address: string;
  ens?: string;
  amountEarnedInToken: number;
  bonusEarnedInToken: number;
  tokenSymbol: string;
};

export const RewardsLeaderboardItem: React.FC<Props> = ({
  address,
  avatarUrl,
  ens,
  amountEarnedInToken,
  bonusEarnedInToken,
  tokenSymbol,
  rank,
}) => {
  const { navigate } = useNavigation();
  const { isDarkMode } = useTheme();
  const formattedAmountEarned = formatTokenDisplayValue(
    amountEarnedInToken,
    tokenSymbol
  );
  const color = !avatarUrl ? addressHashedColorIndex(address) : undefined;
  const emoji = !avatarUrl ? addressHashedEmoji(address) : undefined;

  const formattedBonusEarned = formatTokenDisplayValue(
    bonusEarnedInToken,
    tokenSymbol
  );
  const additionalRewardText = `+${formattedBonusEarned} ${tokenSymbol}`;

  const navigateToProfile = () => {
    navigate(Routes.PROFILE_SHEET, {
      address: ens,
      // TODO: If we want to use it for other rewards we will have to make this analytics configurable
      from: Routes.OP_REWARDS_SHEET,
    });
  };

  return (
    <ButtonPressAnimation
      onPress={navigateToProfile}
      scaleTo={0.96}
      disabled={!ens}
    >
      <Stack>
        <Columns space="10px" alignVertical="center">
          <Column width="content">
            <Box>
              {avatarUrl ? (
                <ImageAvatar image={avatarUrl} size="rewards" />
              ) : (
                <ContactAvatar color={color} size="smedium" value={emoji} />
              )}
            </Box>
          </Column>
          <Stack space="8px">
            <Text color="label" size="15pt" weight="semibold">
              {ens ?? `${address.slice(0, 6)}...${address.slice(-4)}`}
            </Text>
            <Text size="13pt" color="labelTertiary" weight="semibold">
              {formattedAmountEarned}
            </Text>
          </Stack>
          <Column width="content">
            <Inline alignHorizontal="right" alignVertical="center">
              {rank < 4 && (
                <MaskedGradientText
                  text={additionalRewardText}
                  gradientColors={getGradientColorsForRank(rank, isDarkMode)}
                />
              )}
              {rank >= 4 && (
                <Text size="13pt" color="labelTertiary" weight="bold">
                  {additionalRewardText}
                </Text>
              )}
              <Box paddingLeft="8px">
                <Text
                  color="labelTertiary"
                  size="20pt"
                  weight={rank < 4 ? 'heavy' : 'semibold'}
                  containsEmoji={rank < 4}
                >
                  {RANK_SYMBOLS[rank.toString()] ?? rank}
                </Text>
              </Box>
            </Inline>
          </Column>
        </Columns>
      </Stack>
    </ButtonPressAnimation>
  );
};
