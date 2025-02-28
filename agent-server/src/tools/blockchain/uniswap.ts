import { sendTransaction } from "thirdweb";
import {
  createPool,
  enableFeeAmount,
  exactInput,
  exactInputSingle,
  exactOutput,
  exactOutputSingle,
  getPool,
  getUniswapV3Pool,
  setOwner,
} from "thirdweb/extensions/uniswap";
import { Account } from "thirdweb/wallets";

export class Uniswap {
  private contract: any;
  private account: Account;

  constructor(contract: any, account: Account) {
    this.contract = contract;
    this.account = account;
  }

  async createPool(
    tokenA: string,
    tokenB: string,
    fee: number,
    overrides = {}
  ) {
    const transaction = createPool({
      contract: this.contract,
      tokenA,
      tokenB,
      fee,
      overrides,
    });
    return sendTransaction({ transaction, account: this.account });
  }

  async enableFeeAmount(fee: number, tickSpacing: number, overrides = {}) {
    const transaction = enableFeeAmount({
      contract: this.contract,
      fee,
      tickSpacing,
      overrides,
    });
    return sendTransaction({ transaction, account: this.account });
  }

  async swapExactInput(params: any, overrides = {}) {
    const transaction = exactInput({
      contract: this.contract,
      params,
      overrides,
    });
    return sendTransaction({ transaction, account: this.account });
  }

  async swapExactInputSingle(params: any, overrides = {}) {
    const transaction = exactInputSingle({
      contract: this.contract,
      params,
      overrides,
    });
    return sendTransaction({ transaction, account: this.account });
  }

  async swapExactOutput(params: any, overrides = {}) {
    const transaction = exactOutput({
      contract: this.contract,
      params,
      overrides,
    });
    return sendTransaction({ transaction, account: this.account });
  }

  async swapExactOutputSingle(params: any, overrides = {}) {
    const transaction = exactOutputSingle({
      contract: this.contract,
      params,
      overrides,
    });
    return sendTransaction({ transaction, account: this.account });
  }

  async fetchPool(tokenA: string, tokenB: string, fee: number) {
    return getPool({ contract: this.contract, tokenA, tokenB, fee });
  }

  async fetchUniswapV3Pools(tokenA: string, tokenB: string) {
    return getUniswapV3Pool({ contract: this.contract, tokenA, tokenB });
  }

  async updateOwner(newOwner: string, overrides = {}) {
    const transaction = setOwner({
      contract: this.contract,
      newOwner,
      overrides,
    });
    return sendTransaction({ transaction, account: this.account });
  }
}
