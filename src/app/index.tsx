/**
 * OnboardingScreen.tsx
 * ---------------------------------------------------------------------------
 * Civic Pulse — onboarding 3 slide (Expo / React Native + TypeScript).
 * Style: hand-drawn mono UI (ink on paper, satu accent color).
 *
 * Dependencies (semua ada di ekosistem Expo):
 *   npx expo install react-native-svg react-native-safe-area-context expo-status-bar
 *
 * Pemakaian (contoh expo-router, file app/onboarding.tsx):
 *   import { useRouter } from "expo-router";
 *   import OnboardingScreen from "@/screens/onboarding/OnboardingScreen";
 *
 *   export default function Page() {
 *     const router = useRouter();
 *     return <OnboardingScreen onFinish={() => router.replace("/(tabs)")} />;
 *   }
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  useWindowDimensions,
  View,
  ViewStyle,
} from "react-native";
import Svg, { Circle, Defs, G, Path, Pattern } from "react-native-svg";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import {
  clamp,
  darkTheme,
  DoodleName,
  fonts,
  lightTheme,
  Slide,
  slides,
  Theme,
  tokens,
  wobbleRectPath,
} from "../script/index";

type Props = {
  /** dipanggil saat user menekan "Mulai Lapor" di slide terakhir */
  onFinish?: () => void;
  /** dipanggil saat user menekan "Lewati"; default = onFinish */
  onSkip?: () => void;
};

/* ==================================================================== */
/* WobbleBox — border digambar tangan (SVG path), konten tetap crisp     */
/* ==================================================================== */

type WobbleBoxProps = {
  children?: React.ReactNode;
  style?: ViewStyle;
  fill: string;
  stroke: string;
  radius?: number;
  seed?: number;
  amp?: number;
  /** hard offset shadow (px). 0 = tanpa shadow */
  shadow?: number;
  shadowColor?: string;
};

function WobbleBox({
  children,
  style,
  fill,
  stroke,
  radius = tokens.radiusCard,
  seed = 1,
  amp = 1.4,
  shadow = 0,
  shadowColor,
}: WobbleBoxProps) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) =>
      prev.w === width && prev.h === height ? prev : { w: width, h: height },
    );
  }, []);

  const d = useMemo(
    () => (size.w > 0 ? wobbleRectPath(size.w, size.h, radius, seed, amp) : ""),
    [size.w, size.h, radius, seed, amp],
  );

  return (
    <View style={style} onLayout={onLayout}>
      {size.w > 0 && (
        <Svg
          width={size.w + shadow}
          height={size.h + shadow}
          style={styles.absTopLeft}
          pointerEvents="none"
        >
          {shadow > 0 && (
            <Path
              d={d}
              fill={shadowColor ?? stroke}
              transform={`translate(${shadow} ${shadow})`}
            />
          )}
          <Path
            d={d}
            fill={fill}
            stroke={stroke}
            strokeWidth={tokens.stroke}
            strokeLinejoin="round"
          />
        </Svg>
      )}
      {children}
    </View>
  );
}

/* ==================================================================== */
/* Doodles — 2.5px ink line-art, 1 spot-fill, max 1 bagian accent        */
/* ==================================================================== */

type DoodleProps = {
  name: DoodleName;
  size: number;
  theme: Theme;
  rotate?: number;
};

function MiniPin({
  x,
  y,
  scale = 1.5,
  fill,
  dots,
  theme,
}: {
  x: number;
  y: number;
  scale?: number;
  fill: string;
  dots?: string;
  theme: Theme;
}) {
  const body = "M0 0c-4-5-6-8-6-12a6 6 0 0 1 12 0c0 4-2 7-6 12z";
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Path d={body} fill={fill} />
      {dots ? <Path d={body} fill={dots} stroke="none" /> : null}
      <Circle cx={0} cy={-12} r={2.2} fill={theme.ink} stroke="none" />
    </G>
  );
}

function renderDoodle(name: DoodleName, theme: Theme, dotsFill: string) {
  switch (name) {
    /* hero 1: kamera (lensa = spot fill + 1 titik accent) */
    case "camera":
      return (
        <>
          <Path
            d="M8 22h10l4-7h20l4 7h10a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V26a4 4 0 0 1 4-4z"
            fill={theme.paper}
          />
          <Circle cx={32} cy={37} r={11} fill={theme.ink} />
          <Circle cx={32} cy={37} r={11} fill={dotsFill} stroke="none" />
          <Circle cx={32} cy={37} r={4.2} fill={theme.accent} stroke="none" />
          <Path d="M10 29h6M47 29h5" />
        </>
      );

    /* hero 2: peta lipat + pin (panel tengah = spot fill, titik pin = accent) */
    case "mapPin":
      return (
        <>
          <Path d="M6 32l16-5 20 5 16-5v26l-16 5-20-5-16 5z" fill={theme.paper} />
          <Path d="M22 27l20 5v26l-20-5z" fill={theme.ink} />
          <Path d="M22 27l20 5v26l-20-5z" fill={dotsFill} stroke="none" />
          <Path d="M6 32l16-5 20 5 16-5v26l-16 5-20-5-16 5z" />
          <Path
            d="M32 4c-7 0-12 5-12 11 0 9 12 22 12 22s12-13 12-22c0-6-5-11-12-11z"
            fill={theme.paper}
          />
          <Circle cx={32} cy={15} r={4.5} fill={theme.accent} stroke="none" />
        </>
      );

    /* hero 3: area geofence (garis putus) + 3 pin laporan */
    case "geofence":
      return (
        <>
          <Circle
            cx={32}
            cy={36}
            r={26}
            strokeWidth={2}
            strokeDasharray="3 5"
          />
          <MiniPin x={20} y={42} fill={theme.ink} dots={dotsFill} theme={theme} />
          <MiniPin x={43} y={34} fill={theme.accent} theme={theme} />
          <MiniPin x={33} y={57} fill={theme.paper} theme={theme} />
        </>
      );

    /* satellites */
    case "noGallery":
      return (
        <>
          <Path d="M12 12h40a4 4 0 0 1 4 4v32a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" />
          <Path d="M8 44l14-14 10 10 8-8 16 16" />
          <Circle cx={44} cy={24} r={4} />
          <Path d="M6 58L58 6" />
        </>
      );
    case "clock":
      return (
        <>
          <Circle cx={32} cy={32} r={22} />
          <Path d="M32 18v14l9 6" />
        </>
      );
    case "bubble":
      return (
        <>
          <Path d="M10 12h44a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4H30L18 54V42h-8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" />
          <Path d="M18 24h28M18 32h16" />
        </>
      );
    case "sparkle":
      return (
        <Path d="M32 6c2 16 10 24 26 26-16 2-24 10-26 26-2-16-10-24-26-26 16-2 24-10 26-26z" />
      );
    case "ticks":
      return <Path d="M12 40l-8 4M16 28L8 22M30 18l-2-9" />;
    case "check":
      return <Path d="M10 34l14 14L54 16" />;
    case "squiggle":
      return <Path d="M4 32q8-14 14 0t14 0 14 0 14 0" />;
  }
}

function Doodle({ name, size, theme, rotate = 0 }: DoodleProps) {
  const dotsId = `hd-dots-${name}`;
  return (
    <View
      style={{ width: size, height: size, transform: [{ rotate: `${rotate}deg` }] }}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <Pattern
            id={dotsId}
            x="0"
            y="0"
            width="5"
            height="5"
            patternUnits="userSpaceOnUse"
          >
            <Circle cx={1.2} cy={1.2} r={0.6} fill={theme.paper} />
            <Circle cx={3.7} cy={3.7} r={0.6} fill={theme.paper} />
          </Pattern>
        </Defs>
        <G
          fill="none"
          stroke={theme.ink}
          strokeWidth={tokens.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {renderDoodle(name, theme, `url(#${dotsId})`)}
        </G>
      </Svg>
    </View>
  );
}

/* ==================================================================== */
/* Kecil-kecil: arrow, pulse mark, button                                */
/* ==================================================================== */

function Arrow({ dir, color }: { dir: "left" | "right"; color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d={dir === "right" ? "M4 12h15M13 6l6 6-6 6" : "M20 12H5M11 6l-6 6 6 6"}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PulseMark({ color }: { color: string }) {
  return (
    <Svg width={30} height={22} viewBox="0 0 32 24" fill="none">
      <Path
        d="M2 12h7l3-8 5 16 4-12 2 4h9"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

type HdButtonProps = {
  theme: Theme;
  variant: "solid" | "ghost";
  onPress: () => void;
  accessibilityLabel: string;
  seed?: number;
  /** kalau diisi, jadi tombol pill dengan label; kalau tidak, tombol bulat */
  label?: string;
  children?: React.ReactNode;
};

function HdButton({
  theme,
  variant,
  onPress,
  accessibilityLabel,
  seed = 5,
  label,
  children,
}: HdButtonProps) {
  const solid = variant === "solid";
  const round = !label;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={({ pressed }) => ({
        transform: [
          { translateX: pressed ? 2 : 0 },
          { translateY: pressed ? 2 : 0 },
        ],
      })}
    >
      {({ pressed }) => (
        <WobbleBox
          fill={solid ? theme.ink : theme.paper}
          stroke={theme.ink}
          shadow={solid && !pressed ? tokens.liftButton : 0}
          shadowColor={theme.ink3}
          radius={round ? tokens.buttonSize / 2 : 18}
          amp={round ? 0.8 : 1.1}
          seed={seed}
          style={
            round
              ? styles.btnRound
              : { ...styles.btnPill, minHeight: tokens.buttonSize }
          }
        >
          {label ? (
            <Text style={[styles.btnLabel, { color: theme.onInk }]}>{label}</Text>
          ) : null}
          {children}
        </WobbleBox>
      )}
    </Pressable>
  );
}

/* ==================================================================== */
/* Slide page                                                            */
/* ==================================================================== */

function PointRow({ text, theme }: { text: string; theme: Theme }) {
  return (
    <View style={styles.pointRow}>
      <Doodle name="check" size={20} theme={theme} />
      <Text style={[styles.pointText, { color: theme.ink, fontFamily: fonts.body }]}>
        {text}
      </Text>
    </View>
  );
}

function SlidePage({
  slide,
  index,
  width,
  heroHeight,
  theme,
}: {
  slide: Slide;
  index: number;
  width: number;
  heroHeight: number;
  theme: Theme;
}) {
  const heroSize = Math.min(heroHeight - 56, 180);

  return (
    <View style={{ width }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pageContent}
      >
        {/* Hero card */}
        <WobbleBox
          fill={theme.paper}
          stroke={theme.ink}
          shadow={tokens.lift}
          seed={index + 3}
          style={{ height: heroHeight, ...styles.heroCard }}
        >
          <Doodle name={slide.hero} size={heroSize} theme={theme} />

          {slide.satellites.map((s, i) => (
            <View
              key={`${slide.id}-sat-${i}`}
              style={[
                styles.absTopLeft,
                { left: `${s.x}%`, top: `${s.y}%` },
              ]}
              pointerEvents="none"
            >
              <Doodle name={s.kind} size={s.size} theme={theme} rotate={s.rotate} />
            </View>
          ))}

          {slide.note ? (
            <Text
              style={[
                styles.absTopLeft,
                styles.handNote,
                {
                  left: `${slide.note.x}%`,
                  top: `${slide.note.y}%`,
                  color: theme.ink2,
                  transform: [{ rotate: `${slide.note.rotate ?? 0}deg` }],
                },
              ]}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
            >
              {slide.note.text}
            </Text>
          ) : null}
        </WobbleBox>

        {/* Copy */}
        <View style={styles.eyebrow}>
          <Text style={[styles.eyebrowText, { color: theme.ink, borderColor: theme.ink }]}>
            {slide.eyebrow}
          </Text>
        </View>

        <Text
          style={[styles.title, { color: theme.ink, fontFamily: fonts.display }]}
          accessibilityRole="header"
        >
          {slide.title}
        </Text>

        <Text style={[styles.body, { color: theme.ink2, fontFamily: fonts.body }]}>
          {slide.body}
        </Text>

        <View style={styles.points}>
          {slide.points.map((p) => (
            <PointRow key={p} text={p} theme={theme} />
          ))}
        </View>

        {slide.footnote ? (
          <Text style={[styles.footnote, { color: theme.ink2, fontFamily: fonts.body }]}>
            {slide.footnote}
          </Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

/* ==================================================================== */
/* Screen                                                                */
/* ==================================================================== */

export default function OnboardingScreen({ onFinish, onSkip }: Props) {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;

  const { width, height } = useWindowDimensions();
  const heroHeight = clamp(Math.round(height * 0.3), 200, 290);

  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);
  const isLast = index === slides.length - 1;

  const goTo = useCallback((i: number) => {
    listRef.current?.scrollToIndex({ index: i, animated: true });
    setIndex(i);
  }, []);

  const onNext = useCallback(() => {
    if (isLast) onFinish?.();
    else goTo(index + 1);
  }, [goTo, index, isLast, onFinish]);

  const onBack = useCallback(() => {
    if (index > 0) goTo(index - 1);
  }, [goTo, index]);

  const onSkipPress = useCallback(() => {
    (onSkip ?? onFinish)?.();
  }, [onSkip, onFinish]);

  const onMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const next = Math.round(e.nativeEvent.contentOffset.x / width);
      setIndex(clamp(next, 0, slides.length - 1));
    },
    [width],
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.paper2 }]}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />

      {/* Top bar: brand + skip */}
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <PulseMark color={theme.ink} />
          <Text style={[styles.brandText, { color: theme.ink, fontFamily: fonts.display }]}>
            Civic Pulse
          </Text>
        </View>

        {!isLast ? (
          <Pressable
            onPress={onSkipPress}
            accessibilityRole="button"
            accessibilityLabel="Lewati onboarding"
            hitSlop={10}
          >
            <Text style={[styles.skip, { color: theme.ink2, fontFamily: fonts.display }]}>
              Lewati
            </Text>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={(s) => s.id}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
        renderItem={({ item, index: i }) => (
          <SlidePage
            slide={item}
            index={i}
            width={width}
            heroHeight={heroHeight}
            theme={theme}
          />
        )}
      />

      {/* Bottom bar: dots (kiri) + tombol (kanan) */}
      <View style={styles.bottomBar}>
        <View
          style={styles.dots}
          accessible
          accessibilityLabel={`Slide ${index + 1} dari ${slides.length}`}
        >
          {slides.map((s, i) => (
            <View
              key={s.id}
              style={[
                styles.dot,
                {
                  width: i === index ? 22 : 9,
                  backgroundColor: i === index ? theme.ink : theme.paper3,
                },
              ]}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {index > 0 ? (
            <HdButton
              theme={theme}
              variant="ghost"
              onPress={onBack}
              accessibilityLabel="Kembali ke slide sebelumnya"
              seed={11}
            >
              <Arrow dir="left" color={theme.ink} />
            </HdButton>
          ) : null}

          <HdButton
            theme={theme}
            variant="solid"
            onPress={onNext}
            accessibilityLabel={isLast ? "Mulai lapor" : "Slide berikutnya"}
            label={isLast ? "Mulai Lapor" : undefined}
            seed={isLast ? 17 : 13}
          >
            <Arrow dir="right" color={theme.accent} />
          </HdButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ==================================================================== */
/* Styles (layout statis; warna diinject dari theme)                      */
/* ==================================================================== */

const styles = StyleSheet.create({
  screen: { flex: 1 },

  absTopLeft: { position: "absolute", left: 0, top: 0 },

  /* top bar */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 14,
    minHeight: 44,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  brandText: { fontSize: 17, fontWeight: "800", letterSpacing: -0.3 },
  skip: { fontSize: 15, fontWeight: "700", textDecorationLine: "underline" },

  /* page */
  pageContent: { paddingHorizontal: 24, paddingBottom: 16 },
  heroCard: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: tokens.lift, // ruang buat hard shadow
    marginBottom: tokens.lift,
  },
  handNote: { fontSize: 19, lineHeight: 22, fontFamily: fonts.hand },

  eyebrow: { marginTop: 26, alignSelf: "flex-start" },
  eyebrowText: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "700",
    overflow: "hidden",
  },
  title: {
    marginTop: 14,
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.8,
  },
  body: { marginTop: 12, fontSize: 15, lineHeight: 23 },

  points: { marginTop: 18, gap: 10 },
  pointRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  pointText: { flex: 1, fontSize: 14.5, lineHeight: 20, fontWeight: "500" },
  footnote: { marginTop: 16, fontSize: 12.5, lineHeight: 18 },

  /* bottom bar */
  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  dots: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { height: 9, borderRadius: 5 },
  actions: { flexDirection: "row", alignItems: "center", gap: 14 },

  /* buttons */
  btnRound: {
    width: tokens.buttonSize,
    height: tokens.buttonSize,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 24,
    paddingVertical: 15,
  },
  btnLabel: { fontSize: 15, fontWeight: "700" },
});