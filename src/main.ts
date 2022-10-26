let center: [number, number] = [120, 30];
let zoom = 10;
const EARTH_RAD = 6378137;
const EARTH_PERIMETER = 2 * Math.PI * EARTH_RAD;
function lngLat2Mercator(lng: number, lat: number) {
  const x = (lng * Math.PI * EARTH_RAD) / 180;
  let y = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) / (Math.PI / 180);
  y = (y * Math.PI * EARTH_RAD) / 180;
  return [x, y];
}
function mercatorToLngLat(x: number, y: number) {
  let lng = (x / EARTH_RAD / Math.PI) * 180;
  let lat = (y / EARTH_RAD / Math.PI) * 180;
  lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((lat * Math.PI) / 180)) - Math.PI / 2);
  return [lng, lat];
}
const app = document.querySelector('#app') as HTMLElement;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
canvas.width = app.clientWidth;
canvas.height = app.clientHeight;
app.appendChild(canvas);

const render = () => {
  const resolution = (2 * Math.PI * EARTH_RAD) / Math.pow(2, zoom) / 256;
  app.innerHTML = '';
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
  canvas.width = app.clientWidth;
  canvas.height = app.clientHeight;
  app.appendChild(canvas);

  //先将EPSG:4326坐标转换为EPSG:3857坐标
  const center3857 = lngLat2Mercator(center[0], center[1]);
  //计算中心点在行列号(需要注意的是 行列号以左上角为原点，瓦片以[0,0]wgs84坐标为原点)
  const row = Math.floor((center3857[0] + Math.PI * EARTH_RAD) / (resolution * 256));
  const col = Math.floor((Math.PI * EARTH_RAD - center3857[1]) / (resolution * 256));
  // 中心瓦片左上角对应的像素坐标
  let centerTilePos = [row * 256, col * 256];
  console.log('centerTilePos', centerTilePos);

  //计算中心经纬度对应的像素坐标
  const getPxFromLngLat = (lng, lat, z) => {
    let [_x, _y] = lngLat2Mercator(lng, lat); // 4326转3857
    // 转成世界平面图的坐标
    _x += EARTH_PERIMETER / 2;
    _y = EARTH_PERIMETER / 2 - _y;
    //   let resolution = resolutions[z]; // 该层级的分辨率
    // 米/分辨率得到像素
    let x = Math.floor(_x / resolution);
    let y = Math.floor(_y / resolution);
    return [x, y];
  };
  const centerPos = getPxFromLngLat(...center, zoom);
  let offset = [centerPos[0] - centerTilePos[0], centerPos[1] - centerTilePos[1]];

  ctx.translate(app.clientWidth / 2, app.clientHeight / 2);

  let rowMinNum = Math.ceil((app.clientWidth / 2 - offset[0]) / 256); // 左
  let colMinNum = Math.ceil((app.clientHeight / 2 - offset[1]) / 256); // 上
  let rowMaxNum = Math.ceil((app.clientWidth / 2 - (256 - offset[0])) / 256); // 右
  let colMaxNum = Math.ceil((app.clientHeight / 2 - (256 - offset[1])) / 256); // 下

  for (let i = -rowMinNum; i <= rowMaxNum; i++) {
    for (let j = -colMinNum; j <= colMaxNum; j++) {
      // 加载瓦片图片
      let img = new Image();
      img.src = `https://wprd01.is.autonavi.com/appmaptile?style=7&x=${row + i}&y=${col + j}&z=${zoom}`;
      img.onload = () => {
        // 渲染到canvas
        ctx.drawImage(img, i * 256 - offset[0], j * 256 - offset[1]);
      };
    }
  }
};
render();
let isMousedown = false;
window.addEventListener('mousemove', onMousemove);
window.addEventListener('mouseup', onMouseup);
app.addEventListener('mousedown', onMousedown);

function onMousedown(e: MouseEvent) {
  if (e.which === 1) {
    isMousedown = true;
  }
}

function onMouseup() {
  isMousedown = false;
}

function onMousemove(e: MouseEvent) {
  if (!isMousedown) {
    return void 0;
  }
  const resolution = (2 * Math.PI * EARTH_RAD) / Math.pow(2, zoom) / 256;
  // 计算本次拖动的距离对应的经纬度数据
  let mx = e.movementX * resolution;
  let my = e.movementY * resolution;
  // 把当前中心点经纬度转成3857坐标
  let [x, y] = lngLat2Mercator(...center);
  // 更新拖动后的中心点经纬度
  center = mercatorToLngLat(x - mx, my + y);
  render();
  //   console.log('center', center2);
}
window.addEventListener('wheel', onMousewheel);

function onMousewheel(e: WheelEvent) {
  if (e.deltaY > 0) {
    zoom++;
  } else {
    zoom--;
  }
  render();
}
