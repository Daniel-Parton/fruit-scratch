interface Options {
  rawMin: number;
  rawMax: number;
  scaleMin: number;
  scaleMax: number;
}

export class Scaler {
  rawMin: number;
  rawMax: number;
  scaleMin: number;
  scaleMax: number;

  constructor({ rawMin, rawMax, scaleMin, scaleMax }: Options) {
    this.rawMin = rawMin;
    this.rawMax = rawMax;
    this.scaleMin = scaleMin;
    this.scaleMax = scaleMax;
  }

  private reverseInterpolate(value: number) {
    return this.rawMin * (1 - value) + this.rawMax * value;
  }

  private interpolate(value: number) {
    return this.scaleMin * (1 - value) + this.scaleMax * value;
  }

  private uninterpolate(value: number) {
    const b =
      this.rawMax - this.rawMin != 0
        ? this.rawMax - this.rawMin
        : 1 / this.rawMax;
    return (value - this.rawMin) / b;
  }

  private reverseUninterpolate(value: number) {
    const b =
      this.scaleMax - this.scaleMin != 0
        ? this.scaleMax - this.scaleMin
        : 1 / this.scaleMax;
    return (value - this.scaleMin) / b;
  }

  scale(value: number) {
    if (value < this.rawMin) value = this.rawMin;
    if (value > this.rawMax) value = this.rawMax;
    return this.interpolate(this.uninterpolate(value));
  }

  reverseScale(value: number) {
    if (value < this.scaleMin) value = this.scaleMin;
    if (value > this.scaleMax) value = this.scaleMax;
    return this.reverseInterpolate(this.reverseUninterpolate(value));
  }
}
