import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 40,
          background: "#064E3B",
        }}
      >
        <span
          style={{
            fontSize: 100,
            fontWeight: 700,
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            color: "#10B981",
            letterSpacing: 2,
          }}
        >
          A
        </span>
      </div>
    ),
    { ...size }
  );
}
