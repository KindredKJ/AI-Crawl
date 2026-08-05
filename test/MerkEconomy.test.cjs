const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('MERK economy', function () {
  async function fixture() {
    const [owner, treasury, player, recipient] = await ethers.getSigners();
    const token = await ethers.deployContract('MerkToken', [owner.address, treasury.address]);
    const dungeon = await ethers.deployContract('MerkDungeon', [owner.address, await token.getAddress(), treasury.address]);
    return { owner, treasury, player, recipient, token, dungeon };
  }

  it('rejects zero authority addresses', async function () {
    const [owner] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('MerkToken');
    await expect(factory.deploy(owner.address, ethers.ZeroAddress)).to.be.revertedWithCustomError(factory, 'ZeroAddress');
  });

  it('applies the same auditable tax to delegated transfers', async function () {
    const { owner, treasury, player, recipient, token } = await fixture();
    await token.connect(owner).approve(player.address, ethers.parseEther('100'));
    await token.connect(player).transferFrom(owner.address, recipient.address, ethers.parseEther('100'));
    expect(await token.balanceOf(recipient.address)).to.equal(ethers.parseEther('97'));
    expect(await token.balanceOf(treasury.address)).to.equal(ethers.parseEther('2'));
    expect(await token.totalSupply()).to.equal(ethers.parseEther('999999999'));
  });

  it('requires configured floors and records the actual fee received', async function () {
    const { owner, treasury, player, token, dungeon } = await fixture();
    await expect(dungeon.connect(player).enterFloor(1, ethers.id('enter-1')))
      .to.be.revertedWithCustomError(dungeon, 'FloorUnavailable');
    await dungeon.connect(owner).configureFloor(1, ethers.parseEther('10'), true, 'ipfs://floor-1');
    await token.connect(owner).transfer(player.address, ethers.parseEther('20'));
    await token.connect(player).approve(await dungeon.getAddress(), ethers.parseEther('10'));
    const before = await token.balanceOf(treasury.address);
    await expect(dungeon.connect(player).enterFloor(1, ethers.id('enter-1')))
      .to.emit(dungeon, 'FloorEntered')
      .withArgs(player.address, 1, ethers.parseEther('10'), ethers.parseEther('9.9'), ethers.id('enter-1'));
    expect(await token.balanceOf(treasury.address) - before).to.equal(ethers.parseEther('9.9'));
  });

  it('enforces idempotent commands and emergency pause', async function () {
    const { owner, player, dungeon } = await fixture();
    const command = ethers.id('loot-1');
    await dungeon.connect(owner).dropLoot(player.address, 7, 1, command);
    await expect(dungeon.connect(owner).dropLoot(player.address, 7, 1, command))
      .to.be.revertedWithCustomError(dungeon, 'DuplicateCommand');
    await dungeon.connect(owner).pause();
    await expect(dungeon.connect(owner).dropLoot(player.address, 8, 1, ethers.id('loot-2'))).to.be.reverted;
  });
});
