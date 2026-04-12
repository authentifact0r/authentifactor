import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 14,
          background: "#064E3B",
        }}
      >
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            fontStyle: "italic",
            fontFamily: "Georgia, serif",
            color: "#10B981",
            letterSpacing: 1,
          }}
        >
          A
        </span>
      </div>
    ),
    { ...size }
  );
}
