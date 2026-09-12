import { styled } from "styled-components";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/loading.json";

const Wrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  z-index: 9999;
`;

const LottieContainer = styled.div`
  width: 200px;
  height: 200px;
`;

export default function LoadingScreen() {
  return (
    <Wrapper>
      <LottieContainer>
        <Lottie
          animationData={loadingAnimation}
          loop={true}
          autoplay={true}
        />
      </LottieContainer>
    </Wrapper>
  );
}