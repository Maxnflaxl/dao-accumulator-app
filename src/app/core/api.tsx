import Utils from '@core/utils.js';
import { IUserUpdate, IUserViewPrePhase } from '@app/shared/interface/Request';

const dappnet = 'ae928370514fffe952ded36338b3a40326915ffa511b72c99f5e07aba2ee1ac3';
const mainnet = 'ec160307c43bc3fc0c3a52d3e3d3dfd8101593e8cec7a907fc42c9f103aabbae';
const CID = mainnet;

export function onMakeTx(err, sres, full, params: { id: number, vote: number } = null, toasted: string = null) {
  if (err) {
    console.log(err, 'Failed to generate transaction request');
  }
  return new Promise((resolve) => {
    Utils.callApi('process_invoke_data', { data: full.result.raw_data }, (error, result) => {
      resolve(result);
    });
  });
}
export function ViewParams<T = any>(payload): Promise<T> {
  return new Promise((resolve, reject) => {
    Utils.invokeContract(`action=view_params, cid=${CID}`,
      (error, result, full) => {
        if (!error) {
          resolve(result.res);
          console.log('res,', result);
        } else {
          reject(error.error);
          console.log('error', error);
        }
      }, payload || null);
  });
}

export function UserView<T = any>(payload): Promise<T> {
  return new Promise((resolve, reject) => {
    Utils.invokeContract(`action=user_view, cid=${CID}`,
      (error, result, full) => {
        if (!error) {
          resolve(result);
        } else reject(error.error);
      }, payload || null);
  });
}

export function UserLockPrePhase<T = any>({ amountLpToken, lockPeriods, isNph }:IUserViewPrePhase): Promise<T> {
  return new Promise((resolve, reject) => {
    Utils.invokeContract(`
    action=user_lock,
    cid=${CID},
    amountLpToken=${amountLpToken},
    lockPeriods=${lockPeriods},
    isNph= ${isNph}
    `,
    (error, result, full) => {
      if (!error) {
        onMakeTx(error, result, full).then((res) => {
          if (res) {
            resolve(res);
          }
          resolve(result);
        });
      } else {
        reject(error.error);
      }
    });
  });
}
export function UserUpdate<T = any>({
  withdrawBeamX, withdrawLpToken, hEnd, isNph,
}:IUserUpdate): Promise<T> {
  return new Promise((resolve, reject) => {
    Utils.invokeContract(`
    action=user_update,
    cid=${CID},
    withdrawBeamX=${withdrawBeamX},
    withdrawLpToken=${withdrawLpToken},
    hEnd=${hEnd},
    isNph=${isNph}`,
    (error, result, full) => {
      if (!error) {
        onMakeTx(error, result, full).then((res) => {
          if (res) {
            resolve(res);
          }
          resolve(result);
        });
      } else {
        reject(error.error);
      }
    });
  });
}
export function UserGetYield<T = any>({ amountLpToken, lockPeriods, isNph }:IUserViewPrePhase): Promise<T> {
  return new Promise((resolve, reject) => {
    Utils.invokeContract(`
    action=get_yield,
    cid=${CID},
    amountLpToken=${amountLpToken},
    lockPeriods=${lockPeriods}
    isNph: ${isNph}`,
    (error, result, full) => {
      if (!error) {
        resolve(result);
      } else {
        reject(error.error);
      }
    });
  });
}
