每一层的瓦片数量计算公式:

```javascript
// n 为层级
// 2^n 为每一层的瓦片数量
// 2^n * 2^n 为总的瓦片数量
const tileCount = Math.pow(Math.pow(2, n), 2);
```

坐标系简称

- WGS84: 世界标准坐标系
- GCJ02: 火星坐标系
- BD09: 百度坐标系
- EPSG3857: 瓦片坐标系
- EPSG4326: 经纬度坐标系
-     EPSG3395: 球面墨卡托坐标系
-      EPSG900913: 瓦片坐标系
-       EPSG102113: 瓦片坐标系
-        EPSG3785: 瓦片坐标系
