export const  isMobileDevice = () => {
    return !!(
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i)|| 
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i))
  }

export const tryResumeGameSound = (game: Phaser.Game) => {
  const soundContext = (game.sound as Phaser.Sound.WebAudioSoundManager).context;
  if(soundContext && soundContext.state === 'suspended') {
    soundContext.resume();
  }
}