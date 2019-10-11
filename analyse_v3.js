$(function(){
	var api_key="wqg7BG1Mr7X99bixYbGfhX4Q";
	var api_secret="tF5cLKHygNjM4eBBxE3xx78O0angIT2Y";
	var access_token="24.0c9b6f34941d5efce424d1670092dc54.2592000.1567239144.282335-16933993";//利用js脚本写入localstorage，或者手动获取

	body_num=0;
	answer_list=[];
	global_pic=null;

	getMedia();





	$("#analyse_pic").click(function detect_body(){
		takePhoto();
		showLoading(1);
		body_num=0;
		answer_list=[];
		var Pic = document.getElementById("canvas").toDataURL("image/png");
		//console.log(Pic);
		Pic_bs64 = Pic.replace(/^data:image\/(png|jpg);base64,/, "");//得到Base64编码的图片
		//urlcode=encodeURIComponent(Pic_bs64)

		global_pic=Pic;


		$.ajax({
			url:"https://aip.baidubce.com/rest/2.0/image-classify/v1/body_attr?access_token="+access_token,
			type: 'POST',
			contentType:'application/x-www-form-urlencoded',
			data:{
				image:Pic_bs64
			},
			success:function(res){
				console.log(res);
				body_num=res["person_num"];
				answer_list=res["person_info"];
				showLoading(0);
				alert("识别成功！");
				update_dom();
				write_log();


			},
			error:function(e){
				showLoading(0);
				alert("服务器端错误！识别失败！请刷新后重试！");
	            console.log(e.status);
	            console.log(e.responseText);
	        }
		})




	})

    function getMedia() {
        let constraints = {
            video: {
                width: 1280,
                height: 960,
            },
            audio: false
        };
        //获得video摄像头区域
        let video = document.getElementById("video");

        // 避免数据没有获取到
        let promise = navigator.mediaDevices.getUserMedia(constraints);
        // 成功调用
        promise.then(function (MediaStream) {
            /* 使用这个MediaStream */
            video.srcObject = MediaStream;
            video.play();
            console.log(MediaStream); // 对象
        })
        // 失败调用
        promise.catch(function (err) {
            /* 处理error */
            console.log(err); // 拒签
        });
    }

	function takePhoto() {
        //获得Canvas对象
        let video = document.getElementById("video");
        let canvas = document.getElementById("canvas");
        let ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, 640, 480);
        console.log("well done!");
    }

	//获取时间
	function CurentTime(){ 
        var now = new Date();
        
        var year = now.getFullYear();       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日
        
        var hh = now.getHours();            //时
        var mm = now.getMinutes();          //分
        var ss = now.getSeconds();           //秒
        
        var clock = year + "-";
        
        if(month < 10)
            clock += "0";
        
        clock += month + "-";
        
        if(day < 10)
            clock += "0";
            
        clock += day + " ";
        
        if(hh < 10)
            clock += "0";
            
        clock += hh + ":";
        if (mm < 10) clock += '0'; 
        clock += mm + ":"; 
         
        if (ss < 10) clock += '0'; 
        clock += ss; 
        return(clock); 
	};


	//显示or消失正在加载动画
	function showLoading(show){
		if(show){
		   document.getElementById("over").style.display = "block";
		   document.getElementById("layout").style.display = "block";
		}else{
		document.getElementById("over").style.display = "none";
		   document.getElementById("layout").style.display = "none";
		}
	}

	//更新Dom
	function update_dom()
	{
		var headwear={};
		var upper_wear={};
		var bag={};
		var glasses={};
		var smoke={};
		var carrying_item={};
		var cellphone={};

		$(".answer_item").remove();
		$("#answer_num").text(body_num);
		for(var i=0;i<answer_list.length;i++)
		{
			var attributes=answer_list[i]["attributes"];
			//console.log(attributes);
			//console.log(attributes["headewer"]);
			if(headwear[attributes["headwear"]["name"]]==undefined){
				headwear[attributes["headwear"]["name"]]=1;
			}
			else{
				headwear[attributes["headwear"]["name"]]=headwear[attributes["headwear"]["name"]]+1;
			}
			//console.log("*******"+i);

			if(upper_wear[attributes["upper_wear"]["name"]]==undefined){
				upper_wear[attributes["upper_wear"]["name"]]=1;
			}
			else{
				upper_wear[attributes["upper_wear"]["name"]]=upper_wear[attributes["upper_wear"]["name"]]+1;
			}

			if(bag[attributes["bag"]["name"]]==undefined){
				bag[attributes["bag"]["name"]]=1;
			}
			else{
				bag[attributes["bag"]["name"]]=bag[attributes["bag"]["name"]]+1;
			}

			//glasses
			if(glasses[attributes["glasses"]["name"]]==undefined){
				glasses[attributes["glasses"]["name"]]=1;
			}
			else{
				glasses[attributes["glasses"]["name"]]=glasses[attributes["glasses"]["name"]]+1;
			}


			//smoke
			if(smoke[attributes["smoke"]["name"]]==undefined){
				smoke[attributes["smoke"]["name"]]=1;
			}
			else{
				smoke[attributes["smoke"]["name"]]=smoke[attributes["smoke"]["name"]]+1;
			}

			//carrying_item
			if(carrying_item[attributes["carrying_item"]["name"]]==undefined){
				carrying_item[attributes["carrying_item"]["name"]]=1;
			}
			else{
				carrying_item[attributes["carrying_item"]["name"]]=carrying_item[attributes["carrying_item"]["name"]]+1;
			}

			//cellphone
			if(cellphone[attributes["cellphone"]["name"]]==undefined){
				cellphone[attributes["cellphone"]["name"]]=1;
			}
			else{
				cellphone[attributes["cellphone"]["name"]]=cellphone[attributes["cellphone"]["name"]]+1;
			}


		}

		$("#answer_th").after("<tr class='answer_item'><td>帽子</td><td>"+gen_character(headwear)+"</td></tr>");
		$("#answer_th").after("<tr class='answer_item'><td>眼镜</td><td>"+gen_character(glasses)+"</td></tr>");
		$("#answer_th").after("<tr class='answer_item'><td>上衣</td><td>"+gen_character(upper_wear)+"</td></tr>");
		$("#answer_th").after("<tr class='answer_item'><td>背包</td><td>"+gen_character(bag)+"</td></tr>");
		$("#answer_th").after("<tr class='answer_item'><td>吸烟</td><td>"+gen_character(smoke)+"</td></tr>");
		$("#answer_th").after("<tr class='answer_item'><td>手提物</td><td>"+gen_character(carrying_item)+"</td></tr>");
		$("#answer_th").after("<tr class='answer_item'><td>手机</td><td>"+gen_character(cellphone)+"</td></tr>");
	}

	function gen_character(x){
		a=x;
		character="";
		Object.keys(a).forEach(function(key){
			character=character+"【"+key+"】"+":"+a[key]+"人<br>";

		});
		return character;

	}


	function write_log()
	{
		console.log("我在更新日志！");
		var imgObject = new Image();
		imgObject.src = global_pic;
		imgObject.onload=function(){

			//剪切照片并更新DOM
			for(var i=0;i<answer_list.length;i++)
			{
				newImg=cut_picture(imgObject,answer_list[i]["location"]);
				attributes=answer_list[i]["attributes"];
				character="";
				Object.keys(attributes).forEach(function(key){
			    character=character+"【"+key+"】"+":"+attributes[key]["name"]+"<br>";

				});
				//for(let key in attributes){
					//character=character+attributes[key]["name"]+";";
				//}
				$("#answer_log_th").after("<tr class='answer_log_item'><td>"+CurentTime()+"</td><td id='image_td'>"+"</td><td>"+character+"</td><td>"+answer_list[i]["location"]["score"]+"</td></tr>");
				document.getElementById("image_td").innerHTML = "<img alt='' src='"+newImg+"' />";
			}

		}
		
	}




	function cut_picture(imgObject,body_pos) {
		// body...
		var tnCanvas = document.createElement('canvas');
		var tnCanvasContext = tnCanvas.getContext('2d');
		tnCanvas.width = body_pos['width']; tnCanvas.height = body_pos['height'];
	 
	 
	 	var bufferCanvas = document.createElement('canvas');
	 	var bufferContext = bufferCanvas.getContext('2d');
	 	bufferCanvas.width = 640;
	 	bufferCanvas.height = 480;
	 	bufferContext.drawImage(imgObject, 0, 0);
	 
	 	//剪切图像，并在画布上定位被剪切的部分,参数：参考：https://www.cnblogs.com/zhangnan35/p/8467547.html
		tnCanvasContext.drawImage(bufferCanvas, body_pos['left'],body_pos['top'],body_pos['width'], body_pos['height'],0,0,body_pos['width']*0.5, body_pos['height']*0.5);
		var Pic=tnCanvas.toDataURL("image/png");
		return Pic;
	}


})//最外层