$(function(){
	$(".btn").click(function(){
  		alert(1);
  		var canvas=document.getElementById('outputCanvas');
  		var imgURI = canvas.toDataURL("image/png");
        //显示图像
        var image = document.createElement("img");
        image.src = imgURI;
        document.body.appendChild(image);
  	});

	$(".btn").click(function UploadPic() {

		var data = new FormData();
	    // Generate the image data
	    var Pic = document.getElementById("outputCanvas").toDataURL("image/png");
	    Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "")


	    var list={
	    	"api_key":"StPU2c_wn7hEaRVHek3UANw0uvfpzUb0",
	    	'api_secret':'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL',
	    	'image_file':Pic
	    };

	    data.append('api_key', 'StPU2c_wn7hEaRVHek3UANw0uvfpzUb0');
	    data.append('api_secret', 'LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL');
	    data.append('image_file', Pic);

	    // Sending the image data to Server
	    $.ajax({
	    	url:'https://api-cn.faceplusplus.com/facepp/v3/detect',
	        type: 'POST',
	        //data: JSON.stringify(list),
	        //data:{
	        //	api_key:"StPU2c_wn7hEaRVHek3UANw0uvfpzUb0",
		    //	api_secret:"LWP34IdAvz_qLq8Xd8XjQCzemc83TbAL",
		    //	image_file:Pic
		    //    },
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
  
