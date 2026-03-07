import { Text, type TextProps } from "react-native";

export function BrandText({ style, ...props }: TextProps) {
  return (
    <Text {...props} style={[{ fontFamily: "AntiqueOliveNord" }, style]} />
  );
}
