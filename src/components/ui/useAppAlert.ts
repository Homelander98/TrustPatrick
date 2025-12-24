import { useCallback, useRef, useState } from 'react';
import type { AppAlertVariant } from './AppAlertModal';

type ShowParams = {
  title: string;
  message?: string;
  variant?: AppAlertVariant;
  primaryText?: string;
  secondaryText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
};

type AlertState = {
  visible: boolean;
  title: string;
  message?: string;
  variant: AppAlertVariant;
  primaryText: string;
  secondaryText?: string;
};

export function useAppAlert() {
  const primaryCbRef = useRef<(() => void) | undefined>(undefined);
  const secondaryCbRef = useRef<(() => void) | undefined>(undefined);

  const [state, setState] = useState<AlertState>({
    visible: false,
    title: '',
    message: undefined,
    variant: 'info',
    primaryText: 'OK',
    secondaryText: undefined,
  });

  const close = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
    primaryCbRef.current = undefined;
    secondaryCbRef.current = undefined;
  }, []);

  const show = useCallback((params: ShowParams) => {
    primaryCbRef.current = params.onPrimaryPress;
    secondaryCbRef.current = params.onSecondaryPress;

    setState({
      visible: true,
      title: params.title,
      message: params.message,
      variant: params.variant ?? 'info',
      primaryText: params.primaryText ?? 'OK',
      secondaryText: params.secondaryText,
    });
  }, []);

  const onPrimaryPress = useCallback(() => {
    const cb = primaryCbRef.current;
    close();
    cb?.();
  }, [close]);

  const onSecondaryPress = useCallback(() => {
    const cb = secondaryCbRef.current;
    close();
    cb?.();
  }, [close]);

  return {
    alertProps: {
      visible: state.visible,
      title: state.title,
      message: state.message,
      variant: state.variant,
      primaryText: state.primaryText,
      secondaryText: state.secondaryText,
      onPrimaryPress,
      onSecondaryPress: state.secondaryText ? onSecondaryPress : undefined,
      onRequestClose: close,
      dismissOnBackdropPress: false,
    },
    show,
    close,
  };
}
