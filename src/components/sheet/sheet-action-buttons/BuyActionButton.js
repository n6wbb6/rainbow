import lang from 'i18n-js';
import React, { useCallback } from 'react';
import SheetActionButton from './SheetActionButton';
import { analyticsV2 } from '@/analytics';
import showWalletErrorAlert from '@/helpers/support';
import {
  useAccountSettings,
  useExpandedStateNavigation,
  useWallets,
} from '@/hooks';
import config from '@/model/config';
import { useNavigation } from '@/navigation';

import Routes from '@/navigation/routesNames';
import { useRoute } from '@react-navigation/core';

function BuyActionButton({ color: givenColor, ...props }) {
  const { colors } = useTheme();
  const color = givenColor || colors.paleBlue;
  const navigate = useExpandedStateNavigation();
  const { navigate: appNavigate } = useNavigation();
  const { isDamaged } = useWallets();
  const { accountAddress } = useAccountSettings();
  const { name: routeName } = useRoute();

  const handlePress = useCallback(() => {
    if (isDamaged) {
      showWalletErrorAlert();
      return;
    }

    if (!config.wyre_enabled) {
      appNavigate(Routes.EXPLAIN_SHEET, { type: 'wyre_degradation' });
      return;
    }

    navigate(Routes.ADD_CASH_SHEET, params => params);

    analyticsV2.track(analyticsV2.event.buyButtonPressed, {
      componentName: 'BuyActionButton',
      routeName,
    });
  }, [accountAddress, appNavigate, isDamaged, navigate, routeName]);

  return (
    <SheetActionButton
      {...props}
      color={color}
      label={`􀍰 ${lang.t('button.buy_eth')}`}
      onPress={handlePress}
      weight="bold"
    />
  );
}

export default React.memo(BuyActionButton);
