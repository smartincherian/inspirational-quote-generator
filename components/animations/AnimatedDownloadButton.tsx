import React from "react";
import Image from "next/image";

import lottieJson from "../../assets/animated-photo.json";
import {
  CenteredLottie,
  DownloadQuoteCardCont,
  DownloadQuoteCardContext,
} from "./AnimationElements";

interface AnimatedDownloadButtonProps {
  handleDownload: () => void;
}

const AnimatedDownloadButton = ({
  handleDownload,
}: AnimatedDownloadButtonProps) => {
  return (
    <DownloadQuoteCardCont onClick={handleDownload}>
      <CenteredLottie loop animationData={lottieJson} play />

      <DownloadQuoteCardContext>
        Download your quote card
      </DownloadQuoteCardContext>
    </DownloadQuoteCardCont>
  );
};

export default AnimatedDownloadButton;
