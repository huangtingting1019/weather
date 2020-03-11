function setRem(){
    //iphone6设计html字体大小为100px
    let baseScreen = 375;
    let baseSize = 100;
    //获取屏幕大小
    let screenWidth = screen.width;
    let fontSize = 0;

    if(screenWidth >= 1200){
        fontSize = 200;
    }else{
        fontSize = screenWidth/baseScreen * 100;
    }

    //获取html元素
    let html = document.getElementsByTagName('html')[0];
    html.style.fontSize = fontSize + 'px';
}

setRem();

let timers = [];
window.onresize = function(){
    let timer = this.setTimeout(() => {
        for(let i=1;i<timers.length;i++){
            this.clearTimeout(timers[i]);
        }

        timers = [];
        setRem();
    },600)

    timers.push(timer);
}