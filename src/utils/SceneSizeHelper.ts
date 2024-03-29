export const getSceneSizeData = (scene: Phaser.Scene) => {
  const { height, width } = scene.scale;
  const center:Phaser.Types.Math.Vector2Like = {
    x: width / 2,
    y: height / 2
  }
  return {
    height,
    width,
    center
  }
}