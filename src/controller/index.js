const Base = require('./base.js');
const images = require("images");
const axios = require('axios')
const TextToSVG = require('text-to-svg');
const fs = require('fs');
const svg2png = require("svg2png");

module.exports = class extends Base {

    async indexAction() {
        let that = this
        let {
            background = "", //背景的URL图
                image_url_list = [{
                    url: "", //图片的URL
                    isqr: 0, //是否要生成二维码，暂时没有用，挖坑
                    left: 80, //左边距
                    top: 80, //顶边距
                    opacity: 100, //暂时没用
                    width: 110, //图片的宽
                    height: 0
                }],
                text_list = [{
                    text: "过去有你",
                    fontsize: 50, //字号
                    font_color: "#FF0000", //字体颜色
                    left: 200, //左边距
                    top: 80, //顶边距
                    font_x: 0, //字体x坐标
                    font_y: 0, //字体y坐标
                    width: 0, //字体整体的宽，0为自适应
                    height: 0,
                    anchor: 'top' //如果不使用top的话需要定义一下文字的坐标，否则看不到文字
                }, {
                    text: "未来可期",
                    fontsize: 50,
                    font_color: "#FF0000",
                    left: 200,
                    top: 140,
                    width: 0,
                    height: 0,
                    anchor: 'top'
                }, ],
                newWidth = 1080,
                newHeight = 0
        } = that.post()
        let { data: bg } = await axios({ method: "get", url: background, responseType: 'arraybuffer' });
        let img = images(bg)
        for (let item of image_url_list) {
            let { data: imgData } = await axios({ method: "get", url: item.url, responseType: 'arraybuffer' });
            let newImage = images(imgData)
            if (item.width) {
                newImage.resize(item.width)
            }
            img.draw(newImage, item.left, item.top)
        }
        const textToSVG = TextToSVG.loadSync('fonts/字体文件名.ttf'); //加载字体，网上下载的，可以自己设置好字体，不上传默认加载的字体不能显示中文，具体可以看源代码
        for (let item of text_list) {
            let svg = textToSVG.getSVG(item.text, {
                x: item.font_x || 0, //左下角坐标
                y: item.font_y || 0,
                fontSize: item.fontsize,
                anchor: item.anchor, //top,是左上角，默认是左下角
                attributes: {
                    fill: item.font_color // 文字颜色
                }
            });
            let svgPng = await svg2png.sync(svg, !item.width ? {} : { width: item.width, height: item.height })
                // await fs.writeFileSync("imgs/2.png", svgPng)//取消注释可以看到生成的svg图片
            img.draw(images(svgPng), item.left, item.top)

        }
        if (newWidth) {
            img.resize(newWidth, newHeight)
        }
        img.save(`imgs/1.jpg`, 'jpg', { quality: 70 }) //保存图片并设置质量
    }
};