$(function(){

	var api_key="ANfIDkzyGEYfoPI6uO5klCDY";
	var api_secret="kZicb1G7Gh03GWBHNkwu9Gdycx0U9o8K";
	var access_token="24.790f30aafbefe7fd7059591cef298c2a.2592000.1567147167.282335-16924589";//利用js脚本写入localstorage，或者手动获取

	var body_num=0;//室内人数
	var answer_list=[]//识别结果
	var global_pic=null;

	

	$("#addface").click(function add_face(){
		showLoading(1);
		var Pic = document.getElementById("outputCanvas").toDataURL("image/png");
		Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "")//得到Base64编码
		var initial=document.getElementById('inputHelpBlock').value;//获得工号作为user_id

		$.ajax({
			url:"https://aip.baidubce.com/rest/2.0/face/v3/faceset/user/add?access_token="+access_token,
			type: 'POST',
			contentType:'application/json',
			data:{
				"image":Pic,
				"image_type":"BASE64",
				"group_id":"group_1",
				"user_id":initial,
				"action_type":"APPEND"
			},
			success:function(res){
				console.log(res);
				alert("添加成功！");
				showLoading(0);
			},
			error:function(e){
				alert("服务器端错误！添加失败！");
				showLoading(0);
	            console.log(e.status);
	            console.log(e.responseText);
	        }
			
		})

	})

	

	function analysePic(){
		showLoading(1);//触发过度效果
		answer_list=[];
		body_num=0;
		var Pic = document.getElementById("outputCanvas").toDataURL("image/png");
		Pic_bs64 = Pic.replace(/^data:image\/(png|jpg);base64,/, "");//得到Base64编码的图片
		global_pic=Pic;//把图片传给全局变量



		$.ajax({
			url:"https://aip.baidubce.com/rest/2.0/face/v3/multi-search?access_token="+access_token,
			type: 'POST',
			contentType:'application/json',
			data:{
				"image":Pic_bs64,
				"image_type":"BASE64",
				"group_id_list":"group_1",
				"max_face_num":5,
				"action_type":"APPEND",
				"max_user_num":5,
				"liveness_control":"LOW"
			},
			success:function(res){
				console.log(res);
				if(res["error_msg"]=="SUCCESS"){
					result=res["result"];
					body_num=result["face_num"];

					face_list=result["face_list"];
					for(var i=0;i<face_list.length;i++)
					{
						var person={};//人对象
						max_score=-1;
						max_score_pos=0;
						for(var j=0;j<face_list[i]["user_list"].length;j++)
						{
							
							if(face_list[i]["user_list"][j]["score"]>=max_score)
							{
								max_score=face_list[i]["user_list"][j]["score"];
								max_score_pos=j;
							}
						}
						if(max_score>=80){
							person["initial"]=face_list[i]["user_list"][max_score_pos]["user_id"];
							person["score"]=face_list[i]["user_list"][max_score_pos]["score"];

						}
						else{
							person["initial"]="未知身份人物";
						}
						person["location"]=face_list[i]["location"];
						person["date"]=CurentTime();
						answer_list.push(person);//将识别出来的人加入结果集合

					}


				}

				showLoading(0);
				//alert("识别成功！");
				update_DOM();
				write_log();
				

			},
			error:function(e){
				showLoading(0);
				//alert("服务器端错误！识别失败！请刷新后重试！");
	            console.log(e.status);
	            console.log(e.responseText);
	        }

		});
	};



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

	function update_DOM(){
		$(".answer_item").remove();
		$("#answer_num").text(body_num);
		for(var i=0;i<answer_list.length;i++)
		{
			$("#answer_th").after("<tr class='answer_item'><td>"+answer_list[i]["date"]+"</td><td>"+answer_list[i]["initial"]+"</td><td>"+answer_list[i]["score"]+"</td></tr>");
		}

	}


	function write_log()
	{
		var imgObject = new Image();
		imgObject.src = global_pic;
		imgObject.onload=function(){

			//剪切照片并更新DOM
			for(var i=0;i<answer_list.length;i++)
			{
				newImg=cut_picture(imgObject,answer_list[i]["location"]);
				$("#answer_log_th").after("<tr class='answer_log_item'><td>"+answer_list[i]["date"]+"</td><td id='image_td'>"+"</td><td>"+answer_list[i]["initial"]+"</td><td>"+answer_list[i]["score"]+"</td></tr>");
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
		tnCanvasContext.drawImage(bufferCanvas, body_pos['left'],body_pos['top'],body_pos['width'], body_pos['height'],0,0,body_pos['width'], body_pos['height']);
		var Pic=tnCanvas.toDataURL("image/png");
		return Pic;
	}




	$("#analyse_pic").click(function start_task(){
			//setTimeout('analyse_pic()',2000);
			var count = 0;
			var t = window.setInterval(function(){
				analysePic();
				count += 1;
				if(count >= 10){
					window.clearInterval(t);
				}
			},2000);
		});









})//最外层的括号