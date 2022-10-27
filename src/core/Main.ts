import Utils from './Utils';
import { RESOLUTION_LIST, EARTH_RAD } from './Constant';
class Main {
  center: [number, number];
  zoom: number;
  app: HTMLElement;
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  isMousedown: boolean;
  constructor() {
    this.center = [120, 30];
    this.zoom = 17;
    this.isMousedown = false;
    this.app = document.querySelector('#app') as HTMLElement;
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.initCaontainer();
    this.addListener();
    this.render();
  }
  initCaontainer() {
    const { clientWidth, clientHeight } = this.app;
    this.canvas.width = clientWidth;
    this.canvas.height = clientHeight;
    this.ctx.translate(clientWidth / 2, clientHeight / 2);
    this.app.appendChild(this.canvas);
  }
  render() {
    //先清除画布
    this.ctx.clearRect(0, 0, this.app.clientWidth, this.app.clientHeight);
    //先将center的EPSG:4326坐标转换为EPSG:3857坐标
    const center3857 = Utils.lngLat2Mercator(...this.center);
    //计算中心点在行列号(需要注意的是 行列号以左上角为原点，瓦片以[0,0]wgs84坐标为原点)
    const row = Math.floor((center3857[0] + Math.PI * EARTH_RAD) / (RESOLUTION_LIST[this.zoom] * 256));
    const col = Math.floor((Math.PI * EARTH_RAD - center3857[1]) / (RESOLUTION_LIST[this.zoom] * 256));
    // 中心瓦片左上角对应的像素坐标
    const centerTilePos = [row * 256, col * 256];
    const centerPos = Utils.getPxFromLngLat(...this.center, this.zoom);
    const offset = [centerPos[0] - centerTilePos[0], centerPos[1] - centerTilePos[1]];

    let rowMinNum = Math.ceil((this.app.clientWidth / 2 - offset[0]) / 256); // 左
    let colMinNum = Math.ceil((this.app.clientHeight / 2 - offset[1]) / 256); // 上
    let rowMaxNum = Math.ceil((this.app.clientWidth / 2 - (256 - offset[0])) / 256); // 右
    let colMaxNum = Math.ceil((this.app.clientHeight / 2 - (256 - offset[1])) / 256); // 下

    for (let i = -rowMinNum; i <= rowMaxNum; i++) {
      for (let j = -colMinNum; j <= colMaxNum; j++) {
        // 加载瓦片图片
        let img = new Image();
        img.src = `https://wprd01.is.autonavi.com/appmaptile?style=7&x=${row + i}&y=${col + j}&z=${this.zoom}`;
        img.onload = () => {
          // 渲染到canvas
          this.ctx.drawImage(img, i * 256 - offset[0], j * 256 - offset[1]);
        };
      }
    }
  }
  addListener() {
    this.app.addEventListener('mousedown', this.onMousedown.bind(this));
    window.addEventListener('mouseup', this.onMouseup.bind(this));
    window.addEventListener('mousemove', this.onMousemove.bind(this));
    window.addEventListener('wheel', this.onMousewheel.bind(this));
  }
  onMousedown(e: MouseEvent) {
    if (e.which === 1) this.isMousedown = true;
  }
  onMouseup() {
    this.isMousedown = false;
  }
  onMousemove(e: MouseEvent) {
    if (!this.isMousedown) return void 0;
    const resolution = RESOLUTION_LIST[this.zoom];
    // 计算本次拖动的距离对应的经纬度数据
    const mx = e.movementX * resolution;
    const my = e.movementY * resolution;
    const [x, y] = Utils.lngLat2Mercator(...this.center);
    this.center = Utils.mercatorToLngLat(x - mx, y + my);
    this.render();
    return void 0;
  }
  onMousewheel(e: WheelEvent) {
    if (e.deltaY < 0) {
      this.zoom++;
    } else if (e.deltaY > 0) {
      this.zoom--;
    }
    this.render();
  }
}
export default Main;
