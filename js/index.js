$(function () {

    /*6点-12点 6 <= x < 12 moring*/
    /*12点-19点 12 <= x < 19 day*/
    /*19点- 6点 12 <= x < 第二天6点 night*/
  
  
    class Wetaher {
  
      constructor() {
  
        //icon键名标识
        this.flag = 'icon';
  
        //图标基础路径
        this.iconBaseUrl = './images/';
  
        //天气请求基础路径
        this.baseUrl = 'https://api.heweather.net/s6/weather/';
  
        //密钥
        this.key = '4234b045002941f884aeab566a7405f3';
  
        //图标配置
        this.iconsConfig = {
          icon100: {
            code: 100,
            title: '晴',
            imgName: '100.png'
          },
          icon101: {
            code: 101,
            title: '多云',
            imgName: '101.png'
          },
          icon104: {
            code: 104,
            title: '阴',
            imgName: '104.png'
          },
          icon300: {
            code: 300,
            title: '阵雨',
            imgName: '300.png'
          },
          iconDefault: {
            code: -1,
            title: '未知',
            imgName: '-1.png'
          }
        }
      }
  
      //设置背景颜色
      weatherBg() {
        //获取当前时间
        let hours = new Date().getHours();
  
        let $weather = $('.weather');
  
        if (hours >= 6 && hours < 12) {
          $weather.addClass('morning');
        } else if (hours >= 12 && hours < 19) {
          $weather.addClass('day');
        } else {
          $weather.addClass('night');
        }
      }
  
      //定位
      locationCity() {
  
        let self = this;
  
        //使用腾讯地图API获取城市定位
        $.ajax({
          type: 'get',
          data: {
            key: 'SLHBZ-AQWLD-I2T42-H6MMJ-RTCOQ-VIBBB',
            output: 'jsonp'
          },
          url: 'https://apis.map.qq.com/ws/location/v1/ip',
          dataType: 'jsonp',
          jsonp: 'callback',
          success(data) {
            
  
            let city = data.result.ad_info.city;
  
            $('.city').text(city);
  
            //获取定位城市的实况天气
            self.getCurrentWeather(city);
  
            //逐日气预报
            self.dailyForecastWeather(city);
            // self.hourlyForecastWeather(city);
          }
        })
      }
  
      //获取实况天气
      getCurrentWeather(city) {
        let self = this;
        $.ajax({
          type: 'get',
          url: self.baseUrl + 'now',
          data: {
            location: city,
            key: self.key
          },
          success(data) {
            
            let now = data.HeWeather6[0].now;
  
            //体感温度
            $('.weather-tem').text(now.fl + '°');
  
            //天气情况
            $('.w-status').text(now.cond_txt);
  
  
            let $divs = $('.wind-list>div');
  
            $divs.each((i, v) => {
              //获取data-name, data-title
              let dataName = $(v).data('name');
              let dataTitle = $(v).data('title');
  
              $(v).find('.' + dataName).text(now[dataName]);
  
              if (dataTitle) {
                $(v).find('.' + dataTitle).text(now[dataTitle]);
              }
  
            })
  
  
            //分钟级降水
            let basic = data.HeWeather6[0].basic;
            self.minuteLevelRain(basic.lon, basic.lat);
  
          }
        })
      }
  
      //分钟级降水
      minuteLevelRain(lon, lat) {
        //lon: 经度
        //lat: 纬度
        $.ajax({
          type: 'get',
          url: this.baseUrl + 'grid-minute',
          data: {
            location: lon + ',' + lat,
            key: this.key
          },
          success(data) {
            
            if (data.HeWeather6[0].status == 'invalid param') {
              $('.yubao').text('暂无天气预报');
            } else {
              $('.yubao').text(data.HeWeather6[0].grid_minute_forecast.txt);
            }
            
          }
        })
      }
  
      //生成逐日天气数据
      createDaliyForecast(dailyForecast) {
        //设置宽度
        let $weatherDataBox = $('.weather-data-box');
        $weatherDataBox.empty('');
        $weatherDataBox.css({
          width: dailyForecast.length * .7 + 'rem'
        })
  
        //设置最低温、最高温
        let currentDay = dailyForecast[0];
        $('.tmp').text(currentDay.tmp_min + '~' + currentDay.tmp_max);
  
        //遍历生成
        $.each(dailyForecast, (i, v) => {
  
          let currentIconConfig = this.iconsConfig[this.flag + v.cond_code_d];
  
          if (!currentIconConfig) {
            currentIconConfig = this.iconsConfig.iconDefault;
          }
  
          let html = `<div>
        <div>${v.date.split('-').slice(1).join('-')}</div>
        <div>${v.cond_txt_d}</div>
        <div class="icon">
          <img class="auto-img" src="${ this.iconBaseUrl + currentIconConfig.imgName}" alt="" />
        </div>
        <div>${v.tmp_min + '°~' + v.tmp_max }°</div>
      </div>`;
  
          $weatherDataBox.append(html);
        })
      }
  
      //逐日天气预报
      dailyForecastWeather(city) {
  
        let self = this;
  
        //判断是否缓存数据
        let forecastWeather = JSON.parse(localStorage.getItem('forecastWeather'));
        
  
        //存在
        if (forecastWeather.daily.length > 0) {
          
  
          //获取当前日期
          let currentDate = new Date().toLocaleDateString().split('/');
          currentDate[1] = currentDate[1] >= 10 ? currentDate[1] : '0' + currentDate[1];
          currentDate[2] = currentDate[2] >= 10 ? currentDate[2] : '0' + currentDate[2];
          // 
  
          let currentTime = currentDate.join('-');
  
          // 
  
          let oldTime = forecastWeather.daily[0].date;
          // 
  
          if (currentTime == oldTime) {
            self.createDaliyForecast(forecastWeather.daily);
            return;
          }
  
        }
  
        
        $.ajax({
          type: 'get',
          url: this.baseUrl + 'forecast',
          data: {
            location: city,
            key: this.key
          },
          success(data) {
            
  
            let dailyForecast = data.HeWeather6[0].daily_forecast;
  
            self.createDaliyForecast(dailyForecast);
  
            forecastWeather.daily = dailyForecast;
  
            localStorage.setItem('forecastWeather', JSON.stringify(forecastWeather));
  
          }
        })
      }
  
      //创建逐时天气数据
      createHourlyForecast(hourlyForecast) {
        //设置宽度
  
        let $weatherDataBox = $('.weather-data-box');
  
        $weatherDataBox.empty('');
  
        $weatherDataBox.css({
          width: hourlyForecast.length * .7 + 'rem'
        })
  
        //遍历生成
        $.each(hourlyForecast, (i, v) => {
          let currentIconConfig = this.iconsConfig[this.flag + v.cond_code];
  
          if (!currentIconConfig) {
            currentIconConfig = this.iconsConfig.iconDefault;
          }
          let html = `<div>
              <div>${v.time.split(' ')[1]}</div>
              <div>${v.cond_txt}</div>
              <div class="icon">
                <img class="auto-img" src="${this.iconBaseUrl + currentIconConfig.imgName}" alt="" />
              </div>
              <div>${v.tmp}°</div>
            </div>`;
  
          $weatherDataBox.append(html);
        })
      }
  
      //获取年月日时
      getTime() {
  
        let date = new Date();
       
        //获取年份
        let year = date.getFullYear();
  
        //获取月份
        let month = date.getMonth() + 1;
        month = month >= 10 ? month : '0' + month;
  
        //获取日
        let d = date.getDate();
        d = d >= 10 ? d : '0' + d;
  
        //获取时
        let hours = date.getHours() + 1;
        hours = hours < 10 ? '0' + hours : hours == 24 ? '00' : hours;
  
        return year + '-' + month + '-' + d + ' ' + hours + ':00';
  
  
      }
  
      //逐时天气预报
      hourlyForecastWeather(city) {
        let self = this;
  
        //判断是否缓存数据
        let forecastWeather = JSON.parse(localStorage.getItem('forecastWeather'));
        // 
  
        //存在
        if (forecastWeather.hourly.length > 0) {
  
          //获取当前日期
          let currentDate = self.getTime();
          // 
  
          let oldDate = forecastWeather.hourly[0].time;
          // 
  
          if (currentDate == oldDate) {
            console.log('存在逐小时天气数据')
            self.createHourlyForecast(forecastWeather.hourly);
            return;
  
          }
  
        }
  
        
        $.ajax({
          type: 'get',
          url: this.baseUrl + 'hourly',
          data: {
            location: city,
            key: this.key
          },
          success(data) {
            
  
            let hourlyForecast = data.HeWeather6[0].hourly;
  
            self.createHourlyForecast(hourlyForecast);
  
            forecastWeather.hourly = hourlyForecast;
  
            localStorage.setItem('forecastWeather', JSON.stringify(forecastWeather));
  
          }
        })
      }
  
      init() {
  
        this.weatherBg();
  
        //初始化缓存逐日，逐时数据
        if (!localStorage.getItem('forecastWeather')) {
          //逐日: daily
          //逐时: hourly
  
          let forecastWeather = {
            daily: [],
            hourly: []
          }
  
          localStorage.setItem('forecastWeather', JSON.stringify(forecastWeather));
  
        }
  
        this.locationCity();
      }
  
    }
  
    let weather = new Wetaher();
    weather.init();
  
    //切换标签
    let dp = 'dailyForecastWeather';
    $('.day-hour>div').on('click', function () {
  
      let dataProperty = $(this).data('fn');
      
  
      if (dp == dataProperty) {
        
        return;
      }
  
      dp = dataProperty;
  
      let index = $(this).index();
  
      let width = $(this).width();
      let htmlFontSize = parseFloat($('html').css('fontSize'));
  
      let widthRem = width / htmlFontSize;
      // 
  
      $('.move-line').animate({
        left: index * (widthRem + .2) + .1 + 'rem'
      }, 240);
  
      let city = $('.city').text();
      weather[dataProperty](city);
  
    })
  
    //切换城市
    $('.search-icon').on('click', function () {
      let city = $('.search-box').val();
  
      if (city.trim() == '') {
        return;
      }
  
      //清空逐日逐小时天气数据
      let forecastWeather = {
        daily: [],
        hourly: []
      }
  
      localStorage.setItem('forecastWeather', JSON.stringify(forecastWeather));
  
      $('.city').text(city);
  
      $('.search-box').val('');
  
      //获取实况天气
      weather.getCurrentWeather(city);
  
      //获取逐日天气数据
      weather.dailyForecastWeather(city);
    })
  
  
  })