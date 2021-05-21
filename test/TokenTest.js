const Token = artifacts.require('./Token.sol'),
  BigNumber = web3.BigNumber,
  BN = web3.utils.BN;

require('chai').use(require('chai-as-promised')).use(require('chai-bignumber')(BigNumber)).should();

let gasUsedRecords = [];
let gasUsedTotal = 0;

function recordGasUsed(tx, label) {
  gasUsedTotal += tx.receipt.gasUsed;
  gasUsedRecords.push(String(label + ' | GasUsed: ' + tx.receipt.gasUsed).padStart(80));
}

function printGasUsed() {
  console.group('Gas used');
  console.log('-'.repeat(80));
  for (let i = 0; i < gasUsedRecords.length; ++i) {
    console.log(gasUsedRecords[i]);
  }
  console.log(String('Total: ' + gasUsedTotal).padStart(80));
  console.log('-'.repeat(80));
  console.groupEnd();
}

const _totalSupply = '11800000000000000';
contract('Token ', function (accounts) {
  const walletAddress = accounts[0],
    clientAddress = accounts[2],
    otherAddress = accounts[3];

  beforeEach(async function () {
    this.token = await Token.new(_totalSupply, { from: walletAddress });
  });

  after(async () => {
    printGasUsed();
  });
  const transferAmount = 10 * 10 ** 8;
  let walletAddressBalance = new BN(_totalSupply);
  it('valid erc20 interface', async function () {
    const name = await this.token.name();
    name.should.be.equal('Token', 'The name should be Token');
    const symbol = await this.token.symbol();
    symbol.should.be.equal('TTT', 'The name should be TTT');
    const totalSupply = await this.token.totalSupply();
    totalSupply
      .toString()
      .should.be.equal(_totalSupply, 'The totalSupply should be ' + _totalSupply);

    await this.token.transfer(clientAddress, transferAmount);
    walletAddressBalance = walletAddressBalance.sub(new BN(transferAmount));
    const balanceOf = await this.token.balanceOf(clientAddress);
    balanceOf
      .toNumber()
      .should.be.equal(
        transferAmount,
        'After transfer The balanceOf to address should be Token ' + transferAmount
      );
    const balanceOfOnwer = await this.token.balanceOf(walletAddress);
    balanceOfOnwer
      .toString()
      .should.be.equal(
        (_totalSupply - transferAmount).toString(),
        'After transfer The balanceOf from address should be Token ' + _totalSupply - transferAmount
      );
    await this.token.approve(otherAddress, transferAmount);
    const allowanceOfToaddress = await this.token.allowance(walletAddress, otherAddress);
    allowanceOfToaddress
      .toNumber()
      .should.be.equal(
        transferAmount,
        'After approve The to address allowance should be Token ' + transferAmount
      );
    await this.token.transferFrom(walletAddress, otherAddress, 1 * 10 ** 8, { from: otherAddress });
    walletAddressBalance = walletAddressBalance.sub(new BN(1 * 10 ** 8));
    const balanceOfOtherAddress = await this.token.balanceOf(otherAddress);
    balanceOfOtherAddress
      .toNumber()
      .should.be.equal(
        1 * 10 ** 8,
        'After transferFrom The balanceOf from to address should be Token ' + 1 * 10 ** 8
      );
    const real = await this.token.balanceOf(walletAddress);
    real
      .toString()
      .should.be.equal(
        walletAddressBalance.toString(),
        'After transferFrom The balanceOf from to wallet address  should be Token ' +
          walletAddressBalance.toString()
      );
  });

  it('valid PresetMinter', async function () {
    const mintNumber = new BN(1 * 10 ** 8);
    await this.token.mint(walletAddress, mintNumber.toNumber());
    const totalSupply = await this.token.totalSupply();
    totalSupply
      .toString()
      .should.be.equal(
        new BN(_totalSupply).add(mintNumber).toString(),
        'After mint The totalSupply should be ' + new BN(_totalSupply).add(mintNumber).toString()
      );
    const balanceOf = await this.token.balanceOf(walletAddress);
    balanceOf
      .toString()
      .should.be.equal(
        new BN(_totalSupply).add(mintNumber).toString(),
        'After transfer The balanceOf to address should be Token ' +
          new BN(_totalSupply).add(mintNumber).toString()
      );
  });

  it('valid pause', async function () {
    await this.token.pause();
    try {
      await this.token.transfer(clientAddress, transferAmount);
      false.should.be.equal(true, 'After pause not shuould be process here ');
    } catch (error) {
      error.reason.should.be.equal(
        'ERC20Pausable: token transfer while paused',
        'After pause should throw exception reason ERC20Pausable: token transfer while paused'
      );
    }
    await this.token.unpause();
    try {
      await this.token.transfer(clientAddress, transferAmount);
      const balanceOf = await this.token.balanceOf(clientAddress);
      balanceOf
        .toNumber()
        .should.be.equal(
          transferAmount,
          'After transfer The balanceOf to address should be Token ' + transferAmount
        );
    } catch (error) {
      false.should.be.equal(true, 'After unpause not shuould be process here ');
    }
  });

  it('valid burn ', async function () {
    const burnAmount = new BN(100000000);
    await this.token.burn(burnAmount.toString(), { from: walletAddress });
    const totalSupply = await this.token.totalSupply();
    totalSupply
      .toString()
      .should.be.equal(
        new BN(_totalSupply).sub(burnAmount).toString(),
        'The totalSupply should be ' + new BN(_totalSupply).sub(burnAmount).toString()
      );
    const balanece = await this.token.balanceOf(walletAddress);
    balanece
      .toString()
      .should.be.equal(
        new BN(_totalSupply).sub(burnAmount).toString(),
        'The balance should be ' + new BN(_totalSupply).sub(burnAmount).toString()
      );
  });
  it('valid burnfrom', async function () {
    const burnAmount = new BN(100000000);
    await this.token.transfer(otherAddress, burnAmount.toString());
    await this.token.approve(walletAddress, burnAmount.toString(), { from: otherAddress });
    await this.token.burnFrom(otherAddress, burnAmount.toString(), { from: walletAddress });
    const totalSupply = await this.token.totalSupply();
    totalSupply
      .toString()
      .should.be.equal(
        new BN(_totalSupply).sub(burnAmount).toString(),
        'The totalSupply should be ' + new BN(_totalSupply).sub(burnAmount).toString()
      );
    const balanece = await this.token.balanceOf(otherAddress);
    balanece.toString().should.be.equal('0', 'The balance should be 0');
  });
  it('invalid role mint', async function () {
    try {
      await this.token.mint(clientAddress, transferAmount, {from: clientAddress});

    } catch (error) {
      console.log(error)
      false.should.be.equal(false, 'After _mint not shuould be process here ');
    }
    try {
      await this.token._mint(clientAddress, transferAmount);
    } catch (error) {
      console.log(error)
      false.should.be.equal(false, 'After _mint not shuould be process here ');
    }
  });
  
});
