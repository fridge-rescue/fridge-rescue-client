import styled from 'styled-components';

interface BasicTextAreaProps {
  id: string;
  placeholder: string;
  defaultValue?: string;
}

export const BasicTextArea = ({ id, placeholder, defaultValue }: BasicTextAreaProps) => {
  return (
    <>
      <BasicTextAreaWrap
        id={id}
        placeholder={placeholder}
        defaultValue={defaultValue}
      ></BasicTextAreaWrap>
    </>
  );
};

const BasicTextAreaWrap = styled.textarea`
  object-fit: contain;
  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.colors.gray};
  padding: 14px 10px;
`;
