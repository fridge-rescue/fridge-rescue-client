import { getIngredient } from '../api/ingredient/getIngredient';
import { QUERY_KEY } from '../constants/queryKey';
import styled from 'styled-components';
import { useState } from 'react';
import type { Ingredient } from '../types/ingredientType';
import { BasicButton } from './common/BasicButton';
import { theme } from '../styles/theme';
import { useQuery } from '@tanstack/react-query';

interface UpdatedItem {
  [key: number]: Ingredient;
}

export const MyIngredientList = () => {
  const { data } = useQuery({ queryKey: [QUERY_KEY.ADD_INGREDIENT], queryFn: getIngredient });
  const [edit, setEdit] = useState<boolean>(false);
  const [deletedItems, setDeletedItems] = useState<number[]>([]);
  const [updatedItems, setUpdatedItems] = useState<UpdatedItem>({});

  // console.log(updatedItems);

  const handleCheckboxChange = (id: number): void => {
    setDeletedItems((prevDeletedItems) =>
      prevDeletedItems.includes(id)
        ? prevDeletedItems.filter((itemId) => itemId !== id)
        : [...prevDeletedItems, id]
    );

    setUpdatedItems((prevUpdatedItems) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [id]: _, ...rest } = prevUpdatedItems;
      return rest;
    });
  };

  const handleUpdate = (id: number, field: 'expiredAt' | 'memo', value: string): void => {
    if (!deletedItems.includes(id)) {
      setUpdatedItems((prevItems) => {
        const currentItem = data?.find((item) => item.id === id) ?? prevItems[id];
        return {
          ...prevItems,
          [id]: {
            ...currentItem,
            [field]: value,
          },
        };
      });
    }
  };

  const saveChanges = () => {
    const updatedItemsArray = Object.values(updatedItems).map((item) => ({
      id: item.id,
      name: item.name,
      expiredAt: item.expiredAt,
      memo: item.memo,
    }));

    const finalData = {
      deletedItems,
      updatedItems: updatedItemsArray,
    };

    console.log(finalData);

    // TODO: 이후 서버로 전송 로직 추가

    setEdit(false);
    setDeletedItems([]);
    setUpdatedItems({});
  };

  return (
    <Container>
      <TitleWrapper>
        <p>재료 목록</p>
        <div>
          {edit ? (
            <BasicButton
              type="button"
              onClick={saveChanges}
              $bgcolor={theme.colors.orange}
              $fontcolor={theme.colors.white}
            >
              저장
            </BasicButton>
          ) : (
            <BasicButton
              type="button"
              $bgcolor={theme.colors.orange}
              $fontcolor={theme.colors.white}
              onClick={() => setEdit(true)}
            >
              수정
            </BasicButton>
          )}
        </div>
      </TitleWrapper>
      <GridContainer>
        {data?.map((item) => (
          <ItemWrapper key={item.id}>
            <Item>
              <Title>{item.name}</Title>
              {edit && (
                <DeleteCheck>
                  <span>삭제</span>
                  <StyledCheckbox
                    type="checkbox"
                    checked={deletedItems.includes(item.id)}
                    onChange={() => handleCheckboxChange(item.id)}
                  />
                </DeleteCheck>
              )}
              {edit ? (
                <InputWrapper>
                  <p>유통기한</p>
                  <DateInput
                    type="date"
                    defaultValue={item.expiredAt}
                    onChange={(e) => handleUpdate(item.id, 'expiredAt', e.target.value)}
                  />
                  <p>간단 메모</p>
                  <MemoInput
                    type="text"
                    defaultValue={item.memo}
                    onChange={(e) => handleUpdate(item.id, 'memo', e.target.value)}
                  />
                </InputWrapper>
              ) : (
                <InfoWrapper>
                  <span>유통기한</span>
                  <p>{item.expiredAt}</p>
                  <span>간단 메모</span>
                  <p>{item.memo}</p>
                </InfoWrapper>
              )}
            </Item>
          </ItemWrapper>
        ))}
      </GridContainer>
    </Container>
  );
};

const Container = styled.div`
  margin-top: 60px;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px 0 20px 0;
  & > p {
    font-size: 20px;
    font-weight: 600;
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const ItemWrapper = styled.div`
  padding: 3px;
`;

const Item = styled.div`
  background-color: ${(props) => props.theme.colors.grayishWhite};
  padding: 13px;
  border-radius: 10px;
`;

const Title = styled.p`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const DeleteCheck = styled.div`
  margin-bottom: 10px;

  & > span {
    margin-right: 5px;
  }
`;

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  cursor: pointer;
  margin-right: 10px;
  accent-color: ${(props) => props.theme.colors.navy};

  &:hover {
    opacity: 0.8;
  }
`;

const InputWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  place-items: left;

  & > p {
    font-size: 14px;
    color: ${(props) => props.theme.colors.darkGray};
    font-weight: 600;
    margin-bottom: 5px;
  }
`;

const DateInput = styled.input`
  max-width: 135px;
  padding: 10px;
  border: none;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const MemoInput = styled.input`
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 8px;
`;

const InfoWrapper = styled.div`
  & > span {
    display: block;
    margin-bottom: 2px;
    font-size: 14px;
    color: ${(props) => props.theme.colors.darkGray};
    font-weight: 600;
  }

  & > p:nth-child(2) {
    margin-bottom: 10px;
  }

  & > p:nth-child(4) {
    max-width: 300px;
    overflow-y: scroll;
    overflow-y: hidden;

    &::-webkit-scrollbar {
      height: 8px;
      background-color: ${(props) => props.theme.colors.lightGray};
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${(props) => props.theme.colors.gray};
      border-radius: 8px;
    }

    &::-webkit-scrollbar-thumb:hover {
      background-color: ${(props) => props.theme.colors.darkGray};
    }
  }
`;
