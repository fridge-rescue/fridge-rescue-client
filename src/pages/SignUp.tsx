import styled from 'styled-components';
import logo from '../assets/logo.png';
import { BasicInput } from '../components/common/BasicInput';
import { BasicButton } from '../components/common/BasicButton';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { emailAuth, fetchSignUp } from '../api/auth';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { useState } from 'react';
import type { AxiosError } from 'axios';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

interface Data {
  email?: string;
  password?: string;
  nickname?: string;
}

interface SignUpError {
  message: string;
  data?: Data;
}

interface ErrorMsg {
  emailError?: string | undefined;
  passwordError?: string | undefined;
  nicknameError?: string | undefined;
}

interface InputData {
  email?: string;
  pw?: string;
  pwconfirm?: string;
  nickname?: string;
}

export const SignUp = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<ErrorMsg>();
  const [authCode, setAuthCode] = useState<string | undefined>('');
  const [email, setEmail] = useState('');

  const handleError = (error: AxiosError) => {
    const errorData = error.response?.data as SignUpError;

    // TODO: 에러 메시지가 더 많을 경우 switch case로 변경하기
    if (errorData.message === '이미 존재하는 이메일입니다.') {
      setErrorMsg({ emailError: errorData.message });
    } else if (errorData.message === '이미 존재하는 닉네임 입니다.') {
      setErrorMsg({ nicknameError: errorData.message });
    }
  };

  const signUpMutation = useMutation({
    mutationFn: fetchSignUp,
    onSuccess: () => setIsOpen(true),
    onError: handleError,
  });

  const emailAuthMutation = useMutation({
    mutationFn: emailAuth,
    onError: (error) => {
      // eslint-disable-next-line no-console
      console.log(error);
      // eslint-disable-next-line no-alert
      alert('인증에 실패했습니다! 로그인 후 다시 시도해 주세요.');
    },
    onSuccess: () => {
      // eslint-disable-next-line no-alert
      alert('인증에 성공했습니다! 로그인 해 주세요.');
      navigate('/');
    },
  });

  const handleSingUp = async (data: InputData) => {
    setErrorMsg({ emailError: '', passwordError: '', nicknameError: '' });

    const params = {
      email: data.email as string,
      password: data.pw as string,
      nickname: data.nickname as string,
    };
    setEmail(data.email as string);

    signUpMutation.mutate(params);
    // setIsOpen(true);
  };

  const handleAuthAgree = () => {
    if (!authCode) {
      // eslint-disable-next-line no-alert
      alert('코드 확인에 실패했습니다. 로그인 후 다시 시도해 주세요.');
      navigate('/');
      return;
    }

    const finalData = {
      email,
      code: authCode,
    };

    console.log(finalData);

    emailAuthMutation.mutate(finalData);
  };

  const handleAuthCancel = () => {
    // eslint-disable-next-line no-alert
    alert('이후 로그인 후 마이페이서 인증이 가능합니다.');
    navigate('/');
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const onSubmit = handleSingUp;

  const password = watch('pw');

  return (
    <SignUpContainer>
      {isOpen && (
        <ConfirmModal
          isOpen={isOpen}
          handleOpen={setIsOpen}
          title="회원가입이 완료되었습니다!"
          description="가입한 이메일로 발송된 코드 인증시 나만의 냉장고가 생성됩니다."
          onAgree={handleAuthAgree}
          onCancel={handleAuthCancel}
        >
          <AuthInput>
            <BasicInput
              type="number"
              placeholder="인증코드 입력"
              onChange={(e) => setAuthCode(e?.target.value)}
            ></BasicInput>
          </AuthInput>
        </ConfirmModal>
      )}
      <img src={logo} alt="logo" className="logo-image" />
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="inputs">
          <div>
            <label htmlFor="mail">이메일</label>
            {errorMsg && <ErrorMsg>{errorMsg.emailError}</ErrorMsg>}
            {errors.email && (
              <ErrorMessage
                errors={errors}
                name="email"
                render={({ message }) => <ErrorMsg>{message}</ErrorMsg>}
              ></ErrorMessage>
            )}
          </div>
          <Controller
            name="email"
            control={control}
            defaultValue=""
            rules={{
              required: '이메일을 입력해 주세요.',
              maxLength: {
                value: 30,
                message: '이메일은 최대 30자리까지 입력 가능합니다.',
              },
            }}
            render={({ field }) => (
              <BasicInput id="mail" type="email" placeholder="이메일을 입력해 주세요" {...field} />
            )}
          />
          <div>
            <label htmlFor="pw">비밀번호</label>
            {errorMsg && <ErrorMsg>{errorMsg.passwordError}</ErrorMsg>}
            {errors.pw && (
              <ErrorMessage
                errors={errors}
                name="pw"
                render={({ message }) => <ErrorMsg>{message}</ErrorMsg>}
              ></ErrorMessage>
            )}
          </div>
          <Controller
            name="pw"
            control={control}
            defaultValue=""
            rules={{
              required: '비밀번호를 입력해 주세요.',
              minLength: {
                value: 8,
                message: '비밀번호는 최소 8자리 이상이어야 합니다.',
              },
              maxLength: {
                value: 20,
                message: '비밀번호는 최대 20자리까지 입력 가능합니다.',
              },
            }}
            render={({ field }) => (
              <BasicInput
                id="pw"
                type="password"
                placeholder="비밀번호를 입력해 주세요"
                {...field}
              />
            )}
          />
          <div>
            <label htmlFor="pwconfirm">비밀번호 확인</label>
            {errors.pwconfirm && <ErrorMsg>두개의 비밀번호가 일치 하지 않습니다.</ErrorMsg>}
          </div>
          <Controller
            name="pwconfirm"
            control={control}
            defaultValue=""
            rules={{
              required: '비밀번호를 한번 더 입력해 주세요.',
              validate: (value) => value === password,
            }}
            render={({ field }) => (
              <BasicInput
                id="pwconfirm"
                type="password"
                placeholder="비밀번호를 한번 더 입력해 주세요"
                {...field}
              />
            )}
          />
          <div>
            <label htmlFor="nickname">닉네임</label>
            {errorMsg && <ErrorMsg>{errorMsg.nicknameError}</ErrorMsg>}
            <ErrorMessage
              errors={errors}
              name="nickname"
              render={({ message }) => <ErrorMsg>{message}</ErrorMsg>}
            />
          </div>
          <Controller
            name="nickname"
            control={control}
            defaultValue=""
            rules={{
              required: '사용할 닉네임을 입력하세요',
              maxLength: {
                value: 15,
                message: '닉네임은 최대 15자리까지 입력 가능합니다.',
              },
            }}
            render={({ field }) => (
              <BasicInput
                id="nickname"
                type="text"
                placeholder="사용할 닉네임을 입력하세요"
                {...field}
              />
            )}
          />
        </div>
        <BasicButton type="submit" $bgcolor="#FF8527" $fontcolor="#fff" $hoverbgcolor="#ff750c">
          회원 가입
        </BasicButton>
        <Link to="/signin">
          <span className="back">뒤로가기</span>
        </Link>
      </form>
    </SignUpContainer>
  );
};
const SignUpContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;

  .logo-image {
    width: 200px;
    margin-bottom: 24px;
  }

  form {
    width: 60%;
    min-width: 300px;

    .inputs {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  }

  label {
    font-size: 12px;
  }

  .back {
    float: right;
    font-size: 12px;
    margin: 16px 0;
    cursor: pointer;
  }

  button {
    margin-top: 24px;
  }
`;

const AuthInput = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  & > input {
    max-width: 150px;
    margin-bottom: 10px;
    max-height: 25px;
    text-align: center;
  }
`;

const ErrorMsg = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: red;
  margin-left: 5px;
`;
