import { Link } from "react-router-dom";
import { styled } from "styled-components";

const Wrapper = styled.div`
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
`;

const Title = styled.h1`
  font-size: 64px;
  font-weight: 800;
`;

const Message = styled.p`
  opacity: 0.8;
`;

const HomeLink = styled(Link)`
  margin-top: 8px;
  text-decoration: underline;
`;

export default function NotFound() {
  return (
    <Wrapper>
      <Title>404</Title>
      <Message>Sorry, the page you’re looking for can’t be found.</Message>
      <HomeLink to="/">Go back home</HomeLink>
    </Wrapper>
  );
}


