import React, { useEffect, useMemo, useState } from 'react';
import {
  Button, Section, Window, Input, Container, ReactSelect, ListLocks, Loader, NavMenu,
} from '@app/shared/components';
import { useDispatch, useSelector } from 'react-redux';
import { actions } from '@app/containers/Main/store';
import AssetsSection from '@app/shared/components/AssetSection';
import AssetLabel from '@app/shared/components/AssetLabel';
import {
  BEAM_ASSET_ID,
  BEAMX_ASSET_ID,
  FARMING_PERIOD,
  LOCK_PERIOD_SELECT,
  LP_TOKEN_ASSET_ID, LP_TOKEN_ASSET_NPH_ID,
  PLACEHOLDER,
  TABLE_HEADERS, TABLE_HEADERS_FARMING, TABLE_HEADERS_FARMING_NPH,
  TITLE_SECTIONS,
} from '@app/shared/constants/common';
import AssetsContainer from '@app/shared/components/AssetsContainer';
import { useInput } from '@app/shared/hooks';
import { fromGroths, toGroths } from '@core/appUtils';
import { styled } from '@linaria/react';
import {
  IBalanceFull, IOptions, IUserView, LOCK_PERIOD_MONTH,
} from '@app/shared/interface';
import './index.scss';
import {
  selectCurrentBalance, selectIsLoading, selectIsNph, selectPredict,
} from '@app/containers/Main/store/selectors';
import { IUserUpdate, IUserViewPrePhase } from '@app/shared/interface/Request';
import { ArrowDownIcon, ArrowUpIcon } from '@app/shared/icons';

const SectionWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  @media (max-width: 913px){
    flex-direction: column; 
    justify-content: center;
    align-items: center;
  }
`;
const ButtonBlock = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 500px;
`;
const InfoText = styled.div`
  font-weight: 400;
  font-size: 14px;
  line-height: 17px;
  color: white;
  text-transform: uppercase;
`;
const WrapperMenu = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  @media (min-width: 914px)
   {
    width: 914px;
    }
`;

const MainPage: React.FC = () => {
  const isFarming = FARMING_PERIOD;
  const getCurrentBalance: IBalanceFull = useSelector(selectCurrentBalance());
  const isNph = useSelector(selectIsNph());
  const beamPool = getCurrentBalance && getCurrentBalance.res;
  const nphPool = getCurrentBalance && getCurrentBalance['res-nph'];
  const predictStore = useSelector(selectPredict());
  const [currentBalance, setCurrentBalance] = useState<IUserView[]>([]);
  const [currentLockPeriod, setCurrentLockPeriod] = useState<IOptions | null>(null);
  const [requestDataLock, setRequestDataLock] = useState<IUserViewPrePhase>(null);
  const [activeItem, setActiveItem] = useState<number>(1);
  // const [isNph, setIsNph] = useState<boolean>(false);
  const isLoading = useSelector(selectIsLoading());
  const dispatch = useDispatch();

  useMemo(() => {
    if (getCurrentBalance) {
      if (!isNph) {
        setCurrentBalance(beamPool);
      } else {
        setCurrentBalance(nphPool);
      }
    }
  }, [getCurrentBalance, isNph]);
  const amountInputBeam = useInput({
    initialValue: 0,
    validations: isFarming ? { isEmpty: true, isMax: fromGroths(currentBalance['lpToken-post']) } : { isEmpty: true },
  });
  const amountInputBeamX = useInput({
    initialValue: 0,
    validations: { isEmpty: true },
  });

  useMemo(() => {
    dispatch(actions.userGetYield.request({ amountLpToken: toGroths(amountInputBeam.value), lockPeriods: currentLockPeriod && currentLockPeriod.value, isNph: isNph ? 1 : 0 }));
    setRequestDataLock({
      amountLpToken: toGroths(amountInputBeam.value),
      lockPeriods: currentLockPeriod && currentLockPeriod.value,
      isNph: isNph ? 1 : 0,
    });
  }, [amountInputBeamX.value, amountInputBeam.value, currentLockPeriod, isNph]);
  const clearInput = () => {
    amountInputBeamX.onChangeBind(0);
    amountInputBeam.onChangeBind(0);
  };
  const emptyInput = () => {
    amountInputBeam.onChangeBind('');
    amountInputBeamX.onChangeBind('');
  };
  const handleChangeInputBeam = (e) => {
    const { value } = e.target;
    if (value > 0) {
      amountInputBeam.onChange(e);
      amountInputBeamX.onChangeBind(value / 2);
    } else {
      emptyInput();
    }
  };
  const handleChangeInputBeamX = (e) => {
    const { value } = e.target;
    if (value > 0) {
      amountInputBeamX.onChange(e);
      amountInputBeam.onChangeBind(value * 2);
    } else {
      emptyInput();
    }
  };

  const handleRequestLock = (data:IUserViewPrePhase) => {
    dispatch(actions.addUserPrePhase.request(data));
    clearInput();
  };
  const handleActive = () => {
    if (activeItem === 1) {
      setActiveItem(2);
    } else if (activeItem === 2) {
      setActiveItem(1);
    }
  };

  useEffect(() => {
    switch (activeItem) {
      case 1:
        dispatch(actions.setIsNph(0));
        return;
      case 2:
        dispatch(actions.setIsNph(1));
        return;
      default:
        dispatch(actions.setIsNph(0));
    }
  }, [activeItem]);

  return (
    <>
      {isLoading ? <Loader /> : (
        <Window>
          <Container>
            {/* <Title variant="subtitle">Select Pair</Title> */}
            <WrapperMenu>
              <NavMenu onClick={handleActive} active={activeItem} />
            </WrapperMenu>
            <AssetsContainer>
              <SectionWrapper>
                <Section title={isFarming && isNph ? TITLE_SECTIONS.LOCK_AMOUNT_LP_NPH : isFarming ? TITLE_SECTIONS.LOCK_AMOUNT_LP : TITLE_SECTIONS.LOCK_AMOUNT_BEAM}>
                  <AssetsSection>
                    <Input
                      variant="amount"
                      pallete="purple"
                      value={amountInputBeam.value}
                      placeholder="0"
                      onChange={isFarming ? (e) => amountInputBeam.onChange(e) : (e) => handleChangeInputBeam(e)}
                      onFocus={() => !amountInputBeam.value && amountInputBeam.onChangeBind('')}
                    />
                    <AssetLabel title={isFarming ? 'AMML' : 'BEAM'} assets_id={isFarming && isNph ? LP_TOKEN_ASSET_NPH_ID : isFarming ? LP_TOKEN_ASSET_ID : BEAM_ASSET_ID} />
                  </AssetsSection>
                  {isFarming && <InfoText>{`Expected total rewards (at current conditions): ${amountInputBeam.value ? (+fromGroths(predictStore)).toFixed(8) : 0} BEAMX`}</InfoText>}
                </Section>
                {!isFarming ? (
                  <Section title={TITLE_SECTIONS.LOCK_AMOUNT_BEAMX}>
                    <AssetsSection>
                      <Input
                        variant="amount"
                        pallete="purple"
                        value={amountInputBeamX.value}
                        placeholder="0"
                        onChange={isFarming ? (e) => amountInputBeamX.onChange(e) : (e) => handleChangeInputBeamX(e)}
                        onFocus={() => !amountInputBeamX.value && amountInputBeam.onChangeBind('')}
                      />
                      <AssetLabel title="BeamX" assets_id={BEAMX_ASSET_ID} />
                    </AssetsSection>
                  </Section>
                ) : (
                  <Section title={TITLE_SECTIONS.LOCK_PERIOD}>
                    <div className="fees-wrapper">
                      <ReactSelect
                        options={LOCK_PERIOD_SELECT}
                        onChange={(e) => setCurrentLockPeriod(e)}
                        placeholder={PLACEHOLDER.SELECT_LOCK_MONTH}
                        customPrefix="custom-select"
                      />
                    </div>
                    {isFarming ? (
                      <ButtonBlock>
                        <Button
                          style={{ marginTop: '25px' }}
                          icon={ArrowDownIcon}
                          disabled={!amountInputBeam.isValid || !currentLockPeriod}
                          onClick={() => handleRequestLock(requestDataLock)}
                        >

                          {' '}
                          lock
                        </Button>
                      </ButtonBlock>
                    ) : null}
                  </Section>
                )}
              </SectionWrapper>
            </AssetsContainer>
            <AssetsContainer>
              {!isFarming ? (
                <SectionWrapper>
                  <Section title={TITLE_SECTIONS.LOCK_PERIOD}>
                    <div className="fees-wrapper">
                      <ReactSelect
                        options={LOCK_PERIOD_SELECT}
                        onChange={(e) => setCurrentLockPeriod(e)}
                        placeholder={PLACEHOLDER.SELECT_LOCK_MONTH}
                        customPrefix="custom-select"
                      />
                    </div>
                  </Section>
                </SectionWrapper>
              ) : null}
              {/* <InfoSection data={currentBalance} isFarming={isFarming} /> */}
              {getCurrentBalance ? (
                <ListLocks
                  data={currentBalance}
                  isFarming={isFarming}
                  TH={!isFarming ? TABLE_HEADERS : TABLE_HEADERS_FARMING}
                />
              ) : null}
            </AssetsContainer>
            {!isFarming ? (
              <ButtonBlock>
                <Button
                    // onClick={() => handleRequestFarmingLock({
                    //   ...requestDataFarming,
                    //   bLockOrUnlock: 1,
                    // })}
                  icon={ArrowDownIcon}
                  disabled={!amountInputBeam.isValid || !currentLockPeriod}
                  onClick={() => handleRequestLock(requestDataLock)}
                >

                  {' '}
                  lock
                </Button>
              </ButtonBlock>
            ) : null}
          </Container>
        </Window>
      )}
    </>
  );
};

export default MainPage;
