import React, { PureComponent } from "react";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import CountryPicker, {
  getCallingCode,
  DARK_THEME,
  DEFAULT_THEME,
  CountryModalProvider,
  Flag,
} from "react-native-country-picker-modal";
import { PhoneNumberUtil, PhoneNumberFormat as PNF } from "google-libphonenumber";
import styles from "./styles";

const dropDown =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAi0lEQVRYR+3WuQ6AIBRE0eHL1T83FBqU5S1szdiY2NyTKcCAzU/Y3AcBXIALcIF0gRPAsehgugDEXnYQrUC88RIgfpuJ+MRrgFmILN4CjEYU4xJgFKIa1wB6Ec24FuBFiHELwIpQxa0ALUId9wAkhCnuBdQQ5ngP4I9wxXsBDyJ9m+8y/g9wAS7ABW4giBshQZji3AAAAABJRU5ErkJggg==";
const phoneUtil = PhoneNumberUtil.getInstance();

class PhoneInput extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      code: props.defaultCode ? undefined : "44",
      number: props.value
        ? props.value
        : props.defaultValue
        ? props.defaultValue
        : "",
      modalVisible: false,
      countryCode: props.defaultCode ? props.defaultCode : "GB",
      disabled: props.disabled || false,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.disabled !== prevState.disabled) {
      if ((nextProps.value || nextProps.value === "") && nextProps.value !== prevState.number) {
        return ({ disabled: nextProps.disabled, number: nextProps.value });
      }
      return ({ disabled: nextProps.disabled });
    }
    return null;
  };

  async componentDidMount() {
    const { defaultCode } = this.props;
    if (defaultCode) {
      const code = await getCallingCode(defaultCode);
      this.setState({ code });
    }
  }

  getCountryCode = () => {
    return this.state.countryCode;
  };

  getCallingCode = () => {
    return this.state.code;
  };

  isValidNumber = (number) => {
    try {
      const { countryCode } = this.state;
      const parsedNumber = phoneUtil.parse(number, countryCode);
      return phoneUtil.isValidNumber(parsedNumber);
    } catch (err) {
      return false;
    }
  };

  onSelect = (country) => {
    const { onChangeCountry, onChangeText, onChangeFormattedText } = this.props;
    this.setState({
      number: '',
      countryCode: country.cca2,
      code: country.callingCode[0]
    });

    onChangeText('');
    onChangeFormattedText('');

    if (onChangeCountry) {
      onChangeCountry(country);
    }
  };

  onChangeText = (text) => {
    this.setState({ number: text });
    const { onChangeText, onChangeFormattedText, onError } = this.props;

    if (onChangeText) {
      onChangeText(text);
    }

    if (onChangeFormattedText) {
      const { countryCode } = this.state;

      try {
        const number = phoneUtil.parse(text, countryCode);
        const format = phoneUtil.format(number, PNF.E164);

        onChangeFormattedText(format);
      } catch (e) {
        onError(e);
      }
    }
  };

  renderDropdownImage = () => {
    return (
      <Image
        source={{ uri: dropDown }}
        resizeMode="contain"
        style={styles.dropDownImage}
      />
    );
  };

  renderFlagButton = (props) => {
    const { layout = "first", flagSize } = this.props;
    const { countryCode } = this.state;
    if (layout === "first") {
      return (
        <Flag
          countryCode={countryCode}
          flagSize={flagSize ? flagSize : DEFAULT_THEME.flagSize}
        />
      );
    }
    return <View />;
  };

  render() {
    const {
      withShadow,
      withDarkTheme,
      codeTextStyle,
      textInputProps,
      textInputStyle,
      autoFocus,
      placeholder,
      disableArrowIcon,
      flagButtonStyle,
      containerStyle,
      textContainerStyle,
      renderDropdownImage,
      countryPickerProps = {},
      filterProps = {},
      countryPickerButtonStyle,
      layout = "first",
    } = this.props;
    const { modalVisible, code, countryCode, number, disabled } = this.state;
    return (
      <CountryModalProvider>
        <View
          style={[
            styles.container,
            withShadow ? styles.shadow : {},
            containerStyle ? containerStyle : {},
          ]}
        >
          <TouchableOpacity
            style={[
              styles.flagButtonView,
              layout === "second" ? styles.flagButtonExtraWidth : {},
              flagButtonStyle ? flagButtonStyle : {},
              countryPickerButtonStyle ? countryPickerButtonStyle : {},
            ]}
            disabled={disabled}
            onPress={() => this.setState({ modalVisible: true })}
          >
            <CountryPicker
              onSelect={this.onSelect}
              withEmoji
              withFilter
              withFlag
              filterProps={filterProps}
              countryCode={countryCode}
              withCallingCode
              disableNativeModal={disabled}
              visible={modalVisible}
              theme={withDarkTheme ? DARK_THEME : DEFAULT_THEME}
              renderFlagButton={this.renderFlagButton}
              onClose={() => this.setState({ modalVisible: false })}
              {...countryPickerProps}
            />
            {code && layout === "second" && (
              <Text
                style={[styles.codeText, codeTextStyle ? codeTextStyle : {}]}
              >{`+${code}`}</Text>
            )}
            {!disableArrowIcon && (
              <React.Fragment>
                {renderDropdownImage
                  ? renderDropdownImage
                  : this.renderDropdownImage()}
              </React.Fragment>
            )}
          </TouchableOpacity>
          <View
            style={[
              styles.textContainer,
              textContainerStyle ? textContainerStyle : {},
            ]}
          >
            {code && layout === "first" && (
              <Text
                style={[styles.codeText, codeTextStyle ? codeTextStyle : {}]}
              >{`+${code}`}</Text>
            )}
            <TextInput
              style={[styles.numberText, textInputStyle ? textInputStyle : {}]}
              placeholder={placeholder}
              onChangeText={this.onChangeText}
              value={number}
              editable={disabled ? false : true}
              selectionColor="black"
              keyboardAppearance={withDarkTheme ? "dark" : "default"}
              keyboardType="number-pad"
              autoFocus={autoFocus}
              {...textInputProps}
            />
          </View>
        </View>
      </CountryModalProvider>
    );
  }
}

PhoneInput.defaultProps = {
  onError: () => {}
};

export const isValidNumber = (number, countryCode) => {
  try {
    const parsedNumber = phoneUtil.parse(number, countryCode);
    return phoneUtil.isValidNumber(parsedNumber);
  } catch (err) {
    return false;
  }
};

export default PhoneInput;
