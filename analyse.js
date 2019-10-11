$(function(){

	
	var initial_list={};//initial与face_token对应关系
	var answer=[];//摄像头探测结果
	var inter_initial='';//传递initial的全局中间变量

	//此处应该加载localstorage
	var storage=window.localStorage;
	var face_data=storage.getItem("face_data");
	initial_list=JSON.parse(face_data);
	if(initial_list==null)
	{
		initial_list={};
	}
	console.log("读取存储的列表")
	console.log(initial_list);


	$("#get_pic").click(function(){
  		alert(1);
  		var canvas=document.getElementById('outputCanvas');
  		var imgURI = canvas.toDataURL("image/png");
        //显示图像
        var image = document.createElement("img");
        image.src = imgURI;
        document.body.appendChild(image);
  	});



	//按钮触发，弹出对话框，获取用户输入的initial，抓取人脸，添加进face_set，建立face_token与initial的映射关系
  	$("#addface").click(function add_face() {
	// faceset_token='2300cdae442cb7e1faea8dcdc48ca399'
	//通过点击按钮上传图片，调用detect_API,获取face_token,再调用AddFace API,将Face添加到集合中，以便于搜索
	showLoading(1);

	var Pic = document.getElementById("outputCanvas").toDataURL("image/png");
	Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "")//得到Base64编码
	var data1 = new FormData();
	data1.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
	data1.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
	data1.append('image_base64', Pic);

	$.ajax({
	    	url:'https://api-cn.faceplusplus.com/facepp/v3/detect',
	        type: 'POST',
		   	data:data1,
		   	cache: false,
	        processData: false,
	        contentType: false,

	        success: function (result) {
	            //console.log(result);
	            var data2=new FormData();
	            data2.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
				data2.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
				data2.append('faceset_token','2300cdae442cb7e1faea8dcdc48ca399');

	            if(result['faces'].length>0){
	            	var target_face_token=result['faces'][0]['face_token'];
	            	data2.append('face_tokens',target_face_token);
	            	$.ajax({
	            		url:'https://api-cn.faceplusplus.com/facepp/v3/faceset/addface',
	            		type:'POST',
	            		data:data2,
	            		cache: false,
				        processData: false,
				        contentType: false,
	            		
	            		success:function(res){
	            			//target_face_token与initial建立映射关系
	            			//先从网页上获取initial
	            			console.log(res);
	            			var initial=document.getElementById('inputHelpBlock').value;
	            			initial_list[target_face_token]=initial;
	            			alert('添加成功！');
	            			showLoading(0);

	            			//此处应该写入localstorage
	            			var d=JSON.stringify(initial_list);
	            			storage.setItem("face_data",d);
	            			console.log(initial_list);
	            			console.log(face_data);


	            		},
	            		error:function(e){
	            			alert("服务器端错误！添加失败！");
	            			console.log(e.status);
	                		console.log(e.responseText);
	            		}
	            	})



	            }
	            else{
	            	alert("未检测到人脸！添加失败！")
	            	return 0;
	            }

	        },
	        error : function(e){
	                console.log(e.status);
	                console.log(e.responseText);
	            }
	    });

})
  	$("#init_env").click(function init_env(){
  		var data=new FormData();
	    data.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
		data.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
		data.append('faceset_token','2300cdae442cb7e1faea8dcdc48ca399');
		data.append('face_tokens','RemoveAllFaceTokens');
		$.ajax({
			url: 'https://api-cn.faceplusplus.com/facepp/v3/faceset/removeface',
			type:'POST',
			data:data,
	        cache: false,
			processData: false,
			contentType: false,
			success:function(res){
				console.log(res);
				alert("初始化成功！");
			},
			error:function(e){
				console.log(e.status);
	            console.log(e.responseText);
	            alert("出现了错误，请检查网络！");
			}

		})
  	})


  	//人体探测
  	$("#analyse_pic").click(function HumanBody_Detect(){
  	showLoading(1);//触发过度效果
	var Pic = document.getElementById("outputCanvas").toDataURL("image/png");
	Pic_bs64 = Pic.replace(/^data:image\/(png|jpg);base64,/, "");//得到Base64编码的图片
	var data = new FormData();
	data.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
	data.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
	data.append('image_base64', Pic_bs64);
	data.append('return_attributes','upper_body_cloth');

	$.ajax({
	    url:'https://api-cn.faceplusplus.com/humanbodypp/v1/detect',
	    type: 'POST',
		data:data,
		cache: false,
	    processData: false,
	    contentType: false,
	    success: function (result) {//*****************其实应该先检测是正确调用，还是错误调用
	        console.log(result);
	        //alert("人体识别成功！");

	        //把原图初始化为一个image对象
	        var imgObject = new Image();
			imgObject.src = Pic;
			console.log(Pic);
			imgObject.onload=function(){

	        //取出返回值中的humanbody_rectangle字段
	        if (result["humanbodies"].length>0) {
	        	//图片中有人体时
	        	var cuted_body_list=[];//剪下图片存储数组
	        	var body_color_list=[];//衣服颜色
	        	var temp_answer=[];
	        	var temp_body_list=result["humanbodies"];
	        	console.log("人体检测结果：");
	        	console.log(temp_body_list);
	        	for(var i=0;i<temp_body_list.length;i++)
	        	{
	        		var body_pos=temp_body_list[i]["humanbody_rectangle"];//取出body的坐标,此处也可以取出更多特征：包括衣服颜色.....
	        		console.log(imgObject.width)
	        		var processed_pic=cut_picture(imgObject,body_pos);//得到剪下来的图片
	        		cuted_body_list.push(processed_pic);
	        		var body_color=temp_body_list[i]['attributes']['upper_body_cloth']['upper_body_cloth_color'];
	        		body_color_list.push(body_color);
	        		//var target_initial=search_face(processed_pic);//得到initial
	        		//var detected_body={};
	        		//detected_body['date']=CurentTime()
	        		//detected_body['initial']=target_initial;
	        		//detected_body['character']='黑色上衣';
	        		//temp_answer.push(detected_body);
	        		
	        	};
	        	console.log("切下来的图");
	        	console.log(cuted_body_list);

	        	//构造ajax数组
	        	ajax_set=[];
	        	for(var i=0;i<cuted_body_list.length;i++)
	        	{
	        		var data = new FormData();
					data.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
					data.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
					data.append('image_base64', cuted_body_list[i]);
					data.append('faceset_token','2300cdae442cb7e1faea8dcdc48ca399');
					ajax_set.push($.ajax({url:'https://api-cn.faceplusplus.com/facepp/v3/search',type: 'POST',data:data,cache: false,processData: false,contentType: false}));
	        	}

	        	console.log(ajax_set);

	        	//集中发起ajax请求
	        	$.when.apply($, ajax_set).done(function(){
	        		for(var j=0;j<ajax_set.length;j++)
	        			{
	        				result=ajax_set[j]['responseJSON'];
	        				if("results" in result){
		                    	var temp_result_list=result["results"];
							    var pos=0;
							    for(var i=0;i<temp_result_list.length;i++)
							     {
							       	//遍历结果数组，找到可信度最高的结果的索引赋值给pos
							       	if(temp_result_list[i]["confidence"]>=temp_result_list[pos]["confidence"])
							        {
							        	pos=i;
							        }
							    }


						        var target_face_token=temp_result_list[pos]["face_token"];

						        if(target_face_token in initial_list){//face_token不存在于列表中
						        	inter_initial=initial_list[target_face_token];
						        	//alert("工号获取成功");
						        }
						        else{
						        	inter_initial="未知身份人物";
						        	alert("未知身份人物！");

						        }
						        ///构造detected_body，//构造temp_answer，更新answer，更新DOM
						        var detected_body={};
	        					detected_body['date']=CurentTime();
	        					detected_body['initial']=inter_initial;
	        					detected_body['character']=body_color_list[j];
	        					temp_answer.push(detected_body);
	        					
	        					//集中处理返回的结果
	        					answer=temp_answer;
	        					showLoading(0);//过渡效果消失
	        					update_DOM();//更新DOM，识别完成
	        					alert("识别成功,页面已更新!")


	                    }else {
						//未检测到人脸
						alert('未检测到人脸！');
					    return 0;
					    };

	        			}


	                /*$.each(arguments, function(index, arg){
	                    //console.log(JSON.parse(arg[0]).message + ',' + JSON.parse(arg[0]).val);
	                    var result=arg[0];
	                    console.log("result的结果！！")
	                    console.log(result);
	                    console.log(arg[1]);
	                    console.log(ajax_set[0]['responseJSON']['results']);

	                });*/
            	});

	        	/*
	        	//集中处理返回的结果
	        	answer=temp_answer;
	        	update_DOM();//更新DOM，识别完成
	        	alert("识别成功,页面已更新!")
	        	*/
	        } else {
	        	//图片中没有人体
	        	alert('未检测出人体！')
	        	return 0;
	        }

	    }//图片加载函数

	        },
	    error : function(e){
	            console.log(e.status);
	            console.log(e.responseText);
	        }
	    });
	});


	//切图函数，接收图片对象，坐标对象，返回剪切好的图片的base64编码
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
		bs64_Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "");//得到Base64编码的图片
		return bs64_Pic;

	}


	//人脸搜索函数，接收图片，调用人脸搜索API，返回initial
	function search_face(pic) {
		var data = new FormData();
		data.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
		data.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
		data.append('image_base64', pic);
		data.append('faceset_token','2300cdae442cb7e1faea8dcdc48ca399')
		
		$.ajax({
		url:'https://api-cn.faceplusplus.com/facepp/v3/search',
		type: 'POST',
		data:data,
		success: function (result) {
		//提取confidence最高的face_token
		if ("results" in result) {
		    var temp_result_list=result["results"];
		    var pos=0;
		    for(var i=0;i<temp_result_list.length;i++)
		        {
		        	//遍历结果数组，找到可信度最高的结果的索引赋值给pos
		        	if(temp_result_list[i]["confidence"]>=temp_result_list[pos]["confidence"])
		        		{
		        			pos=i;
		        		}
		        }
		        var target_face_token=temp_result_list[pos]["face_token"];
		        var target_face_confi=temp_result_list[pos]["confidence"];

		        if(target_face_token in initial_list && target_face_confi>=70){//face_token不存在于列表中
		        	inter_initial=initial_list[target_face_token];
		        	alert("工号获取成功");
		        }
		        else{
		        	inter_initial="未知身份人物";
		        	alert("未知身份人物！");

		        }

		} else {
			//未检测到人脸
			alert('未检测到人脸！');
		    return 0;
		    };


		        },
		    error : function(e){
		            console.log(e.status);
		            console.log(e.responseText);
		        }
		    });

	}

	function update_DOM(){
		$("#answer_item").remove();
		$("#answer_num").text(answer.length);
		for(var i=0;i<answer.length;i++)
		{
			$("#answer_th").after("<tr id='answer_item'><td>"+answer[i]['date']+"</td><td>"+answer[i]['initial']+"</td><td>"+answer[i]['character']+"</td></tr>");
		}

	}


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

	function showLoading(show){
		if(show){
		   document.getElementById("over").style.display = "block";
		   document.getElementById("layout").style.display = "block";
		}else{
		document.getElementById("over").style.display = "none";
		   document.getElementById("layout").style.display = "none";
		}
	}



  	//测试函数
	$("#get_pic").click(function UploadPic() {

		
	    // Generate the image data
	    console.log(initial_list);
	    var Pic = document.getElementById("outputCanvas").toDataURL("image/png");
	    Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "");//得到Base64编码的图片



	    var data = new FormData();
	    data.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
	    data.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
	    data.append('image_base64', Pic);

	    // Sending the image data to Server
	    $.ajax({
	    	url:'https://api-cn.faceplusplus.com/facepp/v3/detect',
	        type: 'POST',
	        //data: JSON.stringify(list),
	        /*
	        data:{
	        	api_key:"StPU2c_wn7hEaRVHek3UANw0uvfpzUb0",
		    	api_secret:"LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL",
		    	image_base64:Pic
		        },
		     */
		    data: data,
	        cache: false,
	        processData: false,
	        contentType: false,
	        //contentType: 'application/json; charset=utf-8',
	        //dataType: 'json',
	        success: function (result) {
	            console.log(result);
	            alert(result);
	        },
	        error : function(e){
	                console.log(e.status);
	                console.log(e.responseText);
	            }
	    });
	  });



});


/*
function HumanBody_Detect(){
	var Pic = document.getElementById("outputCanvas").toDataURL("image/png");
	Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "");//得到Base64编码的图片
	var data = new FormData();
	data.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
	data.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
	data.append('image_base64', Pic);
	data.append('return_attributes','gender')

	$.ajax({
	    url:'https://api-cn.faceplusplus.com/humanbodypp/v1/detect',
	    type: 'POST',
		data:data,
	    success: function (result) {//*****************其实应该先检测是正确调用，还是错误调用
	        //console.log(result);
	        //alert(result);

	        //把原图初始化为一个image对象
	        var imgObject = new Image();
			imgObject.src = Pic;

	        //取出返回值中的humanbody_rectangle字段
	        if (result["humanbodies"].length>0) {
	        	//图片中有人体时
	        	var temp_body_list=result["humanbodies"];
	        	for(var i=0;i<temp_body_list.length;i++)
	        	{
	        		var body_pos=temp_result_list[i]["humanbody_rectangle"];//取出body的坐标,此处也可以取出更多特征：包括衣服颜色.....
	        		var processed_pic=cut_picture(imgObject,body_pos);//得到剪下来的图片
	        		var target_initial=search_face(processed_pic);//得到initial

	        		//search_face(processed_pic, function(data){
	        			//
	        		//});

	        		
	        	}
	        	//***********************************接下来就是DOM操作的主场了*****************************
	        		//需要将时间信息、initial写入HTML文档中，可以先加入到一个object列表中，最后再统一渲染！
	        		//code......

	        } else {
	        	//图片中没有人体
	        	return 0;
	        }



	        },
	    error : function(e){
	            console.log(e.status);
	            console.log(e.responseText);
	        }
	    });
};

//切图函数，接收图片对象，坐标对象，返回剪切好的图片的base64编码
function cut_picture(imgObject,body_pos) {
	// body...
	var tnCanvas = document.createElement('canvas');
	var tnCanvasContext = canvas.getContext('2d');
	tnCanvas.width = body_pos['width']; tnCanvas.height = body_pos['height'];
 
 
 	var bufferCanvas = document.createElement('canvas');
 	var bufferContext = bufferCanvas.getContext('2d');
 	bufferCanvas.width = imgObj.width;
 	bufferCanvas.height = imgObj.height;
 	bufferContext.drawImage(imgObj, 0, 0);
 
 	//剪切图像，并在画布上定位被剪切的部分,参数：参考：https://www.cnblogs.com/zhangnan35/p/8467547.html
	tnCanvasContext.drawImage(bufferCanvas, startX,startY,body_pos['width'], body_pos['height'],0,0,body_pos['width'], body_pos['height']);
	var Pic=tnCanvas.toDataURL("image/png");
	bs64_Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "");//得到Base64编码的图片
	return bs64_Pic;

}


//人脸搜索函数，接收图片，调用人脸搜索API，返回initial
function search_face(pic) {
	var data = new FormData();
	data.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
	data.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
	data.append('image_base64', pic);
	data.append('faceset_token','2300cdae442cb7e1faea8dcdc48ca399')
	
	$.ajax({
	url:'https://api-cn.faceplusplus.com/humanbodypp/v1/detect',
	type: 'POST',
	

	data:data,
	    success: function (result) {//***************************疑问：如何将ajax执行成功后执行的函数的计算出的结果返回给调用search_face的函数
	        //提取confidence最高的face_token
	        if ("results" in result) {
	        	var temp_result_list=result["results"];
	        	var pos=0;
	        	for(var i=0;i<temp_result_list.length;i++)
	        	{
	        		//遍历结果数组，找到可信度最高的结果的索引赋值给pos
	        		if(temp_result_list[i]["confidence"]>=temp_result_list[pos]["confidence"])
	        		{
	        			pos=i;
	        		}
	        	}
	        	var target_face_token=temp_result_list[pos]["face_token"];//此处也可以取user_id

	        	return initial_list[target_face_token];//查表获得其initial传递出去+++++++++++应该先检测一下face_token是否存在于表中，不在，则返回未知身份

	        } else {//未检测到人脸
	        	return 0;
	        }；


	        },
	    error : function(e){
	            console.log(e.status);
	            console.log(e.responseText);
	        }
	    });

}

//++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++=Ques:怎么让映射表可以被所有函数访问？

//按钮触发，弹出对话框，获取用户输入的initial，抓取人脸，添加进face_set，建立face_token与initial的映射关系
function add_face() {
	// faceset_token='2300cdae442cb7e1faea8dcdc48ca399'
	//通过点击按钮上传图片，调用detect_API,获取face_token,再调用AddFace API,将Face添加到集合中，以便于搜索

	var Pic = document.getElementById("outputCanvas").toDataURL("image/png");
	Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "")//得到Base64编码
	var data1 = new FormData();
	data1.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
	data1.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
	data1.append('image_base64', Pic);

	$.ajax({
	    	url:'https://api-cn.faceplusplus.com/facepp/v3/detect',
	        type: 'POST',
		   	data:data1,
	        success: function (result) {
	            //console.log(result);
	            //alert(result);
	            var data2=new FormData();
	            data2.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
				data2.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
				data2.append('faceset_token','2300cdae442cb7e1faea8dcdc48ca399');



	            if(result['faces']>0){
	            	var target_face_token=result['faces'][0]['face_token'];
	            	data2.append('face_tokens',target_face_token);
	            	$.ajax({
	            		url:'https://api-cn.faceplusplus.com/facepp/v3/faceset/addface',
	            		type:'POST',
	            		data:data2,
	            		success:function(res){
	            			//target_face_token与initial建立映射关系（待补全)
	            			//先从网页上获取initial
	            			var initial=document.getElementById('inputHelpBlock').value;
	            			initial_list[target_face_token]=initial;
	            			alert('添加成功！');


	            		}
	            		error:function(e){
	            			alert("服务器端错误！添加失败！");
	            			console.log(e.status);
	                		console.log(e.responseText);
	            		}
	            	})



	            }
	            else{
	            	alert("未检测到人脸！添加失败！")
	            	return 0;
	            }

	        },
	        error : function(e){
	                console.log(e.status);
	                console.log(e.responseText);
	            }
	    });

}

function update_DOM(){
	$("#answer_item").remove();
	for(var i=0;i<answer.length;i++)
	{
		$("#answer_th").after("<tr id='answer_item'><td>"+answer[i]['date']+"</td><td>"+answer[i]['initial']+"</td><td>"+answer[i]['character']+"</td></tr>");
	}

}


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











/*

let faceConfig = {
    face_token : '',
}
let faceAttributes = {};


function detectImg() {
	var Pic = document.getElementById("outputCanvas").toDataURL("image/png");
    Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "")

    let url = 'https://api-cn.faceplusplus.com/facepp/v3/detect';
    let data = new FormData();
    data.append('api_key', "ri01AlUOp4DUzMzMYCjERVeRw88hlvCa");
    data.append('api_secret', "pF3JOAxBENEYXV-Q96A3s-CkyWqBg49u");
    data.append('image_file', files[0]);
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        success(data) {
            faceConfig.face_token = data.faces[0].face_token;
            analyzeImg(); //调用分析图片的函数
        }
    })
}

function analyzeImg() {
    let url = 'https://api-cn.faceplusplus.com/facepp/v3/face/analyze';
    $.ajax({
        url: url,
        type: 'POST',
        data: {
            api_key: "ri01AlUOp4DUzMzMYCjERVeRw88hlvCa",
            api_secret: "pF3JOAxBENEYXV-Q96A3s-CkyWqBg49u",
            face_tokens: faceConfig.face_token,
            return_attributes: "gender,age,smiling,ethnicity,skinstatus,eyestatus"
        },
        success(data) {
            // console.log(data);
            let attributes = data.faces[0].attributes;
            faceAttributes = {
                age : attributes.age.value,
                gender: attributes.gender.value,
                ethnicity: attributes.ethnicity.value,
                glass: attributes.glass.value,
                skinstatus: attributes.skinstatus
            }
            console.log(faceAttributes);
            //用jQuery获取模板
            var tpl   =  $("#tpl").html();
            //预编译模板
            var template = Handlebars.compile(tpl);
            //匹配json内容
            var html = template(faceAttributes);
            //输入模板
            $('#result').html(html);
        }
    })
}

*/


  // });
  
