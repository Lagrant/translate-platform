/**
 * baiduTemplate绠€鍗曞ソ鐢ㄧ殑Javascript妯℃澘寮曟搸 1.0.6 鐗堟湰
 * http://baidufe.github.com/BaiduTemplate
 * 寮€婧愬崗璁細BSD License
 * 娴忚鍣ㄧ幆澧冨崰鐢ㄥ懡鍚嶇┖闂� baidu.template 锛宯odejs鐜鐩存帴瀹夎 npm install baidutemplate
 * @param str{String} dom缁撶偣ID锛屾垨鑰呮ā鏉縮tring
 * @param data{Object} 闇€瑕佹覆鏌撶殑json瀵硅薄锛屽彲浠ヤ负绌恒€傚綋data涓簕}鏃讹紝浠嶇劧杩斿洖html銆�
 * @return 濡傛灉鏃燿ata锛岀洿鎺ヨ繑鍥炵紪璇戝悗鐨勫嚱鏁帮紱濡傛灉鏈塪ata锛岃繑鍥瀐tml銆�
 * @author wangxiao 
 * @email 1988wangxiao@gmail.com
*/

;(function(window){

    //鍙栧緱娴忚鍣ㄧ幆澧冪殑baidu鍛藉悕绌洪棿锛岄潪娴忚鍣ㄧ幆澧冪鍚坈ommonjs瑙勮寖exports鍑哄幓
    //淇鍦╪odejs鐜涓嬶紝閲囩敤baidu.template鍙橀噺鍚�
    var baidu = typeof module === 'undefined' ? (window.baidu = window.baidu || {}) : module.exports;

    //妯℃澘鍑芥暟锛堟斁缃簬baidu.template鍛藉悕绌洪棿涓嬶級
    baidu.template = function(str, data){

        //妫€鏌ユ槸鍚︽湁璇d鐨勫厓绱犲瓨鍦紝濡傛灉鏈夊厓绱犲垯鑾峰彇鍏冪礌鐨刬nnerHTML/value锛屽惁鍒欒涓哄瓧绗︿覆涓烘ā鏉�
        var fn = (function(){

            //鍒ゆ柇濡傛灉娌℃湁document锛屽垯涓洪潪娴忚鍣ㄧ幆澧�
            if(!window.document){
                return bt._compile(str);
            };

            //HTML5瑙勫畾ID鍙互鐢变换浣曚笉鍖呭惈绌烘牸瀛楃鐨勫瓧绗︿覆缁勬垚
            var element = document.getElementById(str);
            if (element) {
                    
                //鍙栧埌瀵瑰簲id鐨刣om锛岀紦瀛樺叾缂栬瘧鍚庣殑HTML妯℃澘鍑芥暟
                if (bt.cache[str]) {
                    return bt.cache[str];
                };

                //textarea鎴杋nput鍒欏彇value锛屽叾瀹冩儏鍐靛彇innerHTML
                var html = /^(textarea|input)$/i.test(element.nodeName) ? element.value : element.innerHTML;
                return bt._compile(html);

            }else{

                //鏄ā鏉垮瓧绗︿覆锛屽垯鐢熸垚涓€涓嚱鏁�
                //濡傛灉鐩存帴浼犲叆瀛楃涓蹭綔涓烘ā鏉匡紝鍒欏彲鑳藉彉鍖栬繃澶氾紝鍥犳涓嶈€冭檻缂撳瓨
                return bt._compile(str);
            };

        })();

        //鏈夋暟鎹垯杩斿洖HTML瀛楃涓诧紝娌℃湁鏁版嵁鍒欒繑鍥炲嚱鏁� 鏀寔data={}鐨勬儏鍐�
        var result = bt._isObject(data) ? fn( data ) : fn;
        fn = null;

        return result;
    };

    //鍙栧緱鍛藉悕绌洪棿 baidu.template
    var bt = baidu.template;

    //鏍囪褰撳墠鐗堟湰
    bt.versions = bt.versions || [];
    bt.versions.push('1.0.6');

    //缂撳瓨  灏嗗搴攊d妯℃澘鐢熸垚鐨勫嚱鏁扮紦瀛樹笅鏉ャ€�
    bt.cache = {};
    
    //鑷畾涔夊垎闅旂锛屽彲浠ュ惈鏈夋鍒欎腑鐨勫瓧绗︼紝鍙互鏄疕TML娉ㄩ噴寮€澶� <! !>
    bt.LEFT_DELIMITER = bt.LEFT_DELIMITER||'<%';
    bt.RIGHT_DELIMITER = bt.RIGHT_DELIMITER||'%>';

    //鑷畾涔夐粯璁ゆ槸鍚﹁浆涔夛紝榛樿涓洪粯璁よ嚜鍔ㄨ浆涔�
    bt.ESCAPE = true;

    //HTML杞箟
    bt._encodeHTML = function (source) {
        return String(source)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/\\/g,'&#92;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;');
    };

    //杞箟褰卞搷姝ｅ垯鐨勫瓧绗�
    bt._encodeReg = function (source) {
        return String(source).replace(/([.*+?^=!:${}()|[\]/\\])/g,'\\$1');
    };

    //杞箟UI UI鍙橀噺浣跨敤鍦℉TML椤甸潰鏍囩onclick绛変簨浠跺嚱鏁板弬鏁颁腑
    bt._encodeEventHTML = function (source) {
        return String(source)
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;')
            .replace(/"/g,'&quot;')
            .replace(/'/g,'&#39;')
            .replace(/\\\\/g,'\\')
            .replace(/\\\//g,'\/')
            .replace(/\\n/g,'\n')
            .replace(/\\r/g,'\r');
    };

    //灏嗗瓧绗︿覆鎷兼帴鐢熸垚鍑芥暟锛屽嵆缂栬瘧杩囩▼(compile)
    bt._compile = function(str){
        var funBody = "var _template_fun_array=[];\nvar fn=(function(__data__){\nvar _template_varName='';\nfor(name in __data__){\n_template_varName+=('var '+name+'=__data__[\"'+name+'\"];');\n};\neval(_template_varName);\n_template_fun_array.push('"+bt._analysisStr(str)+"');\n_template_varName=null;\n})(_template_object);\nfn = null;\nreturn _template_fun_array.join('');\n";
        return new Function("_template_object",funBody);
    };

    //鍒ゆ柇鏄惁鏄疧bject绫诲瀷
    bt._isObject = function (source) {
        return 'function' === typeof source || !!(source && 'object' === typeof source);
    };

    //瑙ｆ瀽妯℃澘瀛楃涓�
    bt._analysisStr = function(str){

        //鍙栧緱鍒嗛殧绗�
        var _left_ = bt.LEFT_DELIMITER;
        var _right_ = bt.RIGHT_DELIMITER;

        //瀵瑰垎闅旂杩涜杞箟锛屾敮鎸佹鍒欎腑鐨勫厓瀛楃锛屽彲浠ユ槸HTML娉ㄩ噴 <!  !>
        var _left = bt._encodeReg(_left_);
        var _right = bt._encodeReg(_right_);

        str = String(str)
            
            //鍘绘帀鍒嗛殧绗︿腑js娉ㄩ噴
            .replace(new RegExp("("+_left+"[^"+_right+"]*)//.*\n","g"), "$1")

            //鍘绘帀娉ㄩ噴鍐呭  <%* 杩欓噷鍙互浠绘剰鐨勬敞閲� *%>
            //榛樿鏀寔HTML娉ㄩ噴锛屽皢HTML娉ㄩ噴鍖归厤鎺夌殑鍘熷洜鏄敤鎴锋湁鍙兘鐢� <! !>鏉ュ仛鍒嗗壊绗�
            .replace(new RegExp("<!--.*?-->", "g"),"")
            .replace(new RegExp(_left+"\\*.*?\\*"+_right, "g"),"")

            //鎶婃墍鏈夋崲琛屽幓鎺�  \r鍥炶溅绗� \t鍒惰〃绗� \n鎹㈣绗�
            .replace(new RegExp("[\\r\\t\\n]","g"), "")

            //鐢ㄦ潵澶勭悊闈炲垎闅旂鍐呴儴鐨勫唴瀹逛腑鍚湁 鏂滄潬 \ 鍗曞紩鍙� 鈥� 锛屽鐞嗗姙娉曚负HTML杞箟
            .replace(new RegExp(_left+"(?:(?!"+_right+")[\\s\\S])*"+_right+"|((?:(?!"+_left+")[\\s\\S])+)","g"),function (item, $1) {
                var str = '';
                if($1){

                    //灏� 鏂滄潬 鍗曞紩 HTML杞箟
                    str = $1.replace(/\\/g,"&#92;").replace(/'/g,'&#39;');
                    while(/<[^<]*?&#39;[^<]*?>/g.test(str)){

                        //灏嗘爣绛惧唴鐨勫崟寮曞彿杞箟涓篭r  缁撳悎鏈€鍚庝竴姝ワ紝鏇挎崲涓篭'
                        str = str.replace(/(<[^<]*?)&#39;([^<]*?>)/g,'$1\r$2')
                    };
                }else{
                    str = item;
                }
                return str ;
            });


        str = str 
            //瀹氫箟鍙橀噺锛屽鏋滄病鏈夊垎鍙凤紝闇€瑕佸閿�  <%var val='test'%>
            .replace(new RegExp("("+_left+"[\\s]*?var[\\s]*?.*?[\\s]*?[^;])[\\s]*?"+_right,"g"),"$1;"+_right_)

            //瀵瑰彉閲忓悗闈㈢殑鍒嗗彿鍋氬閿�(鍖呮嫭杞箟妯″紡 濡�<%:h=value%>)  <%=value;%> 鎺掗櫎鎺夊嚱鏁扮殑鎯呭喌 <%fun1();%> 鎺掗櫎瀹氫箟鍙橀噺鎯呭喌  <%var val='test';%>
            .replace(new RegExp("("+_left+":?[hvu]?[\\s]*?=[\\s]*?[^;|"+_right+"]*?);[\\s]*?"+_right,"g"),"$1"+_right_)

            //鎸夌収 <% 鍒嗗壊涓轰竴涓釜鏁扮粍锛屽啀鐢� \t 鍜屽湪涓€璧凤紝鐩稿綋浜庡皢 <% 鏇挎崲涓� \t
            //灏嗘ā鏉挎寜鐓�<%鍒嗕负涓€娈典竴娈电殑锛屽啀鍦ㄦ瘡娈电殑缁撳熬鍔犲叆 \t,鍗崇敤 \t 灏嗘瘡涓ā鏉跨墖娈靛墠闈㈠垎闅斿紑
            .split(_left_).join("\t");

        //鏀寔鐢ㄦ埛閰嶇疆榛樿鏄惁鑷姩杞箟
        if(bt.ESCAPE){
            str = str

                //鎵惧埌 \t=浠绘剰涓€涓瓧绗�%> 鏇挎崲涓� 鈥橈紝浠绘剰瀛楃,'
                //鍗虫浛鎹㈢畝鍗曞彉閲�  \t=data%> 鏇挎崲涓� ',data,'
                //榛樿HTML杞箟  涔熸敮鎸丠TML杞箟鍐欐硶<%:h=value%>  
                .replace(new RegExp("\\t=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':baidu.template._encodeHTML($1),'");
        }else{
            str = str
                
                //榛樿涓嶈浆涔塇TML杞箟
                .replace(new RegExp("\\t=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':$1,'");
        };

        str = str

            //鏀寔HTML杞箟鍐欐硶<%:h=value%>  
            .replace(new RegExp("\\t:h=(.*?)"+_right,"g"),"',typeof($1) === 'undefined'?'':baidu.template._encodeHTML($1),'")

            //鏀寔涓嶈浆涔夊啓娉� <%:=value%>鍜�<%-value%>
            .replace(new RegExp("\\t(?::=|-)(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':$1,'")

            //鏀寔url杞箟 <%:u=value%>
            .replace(new RegExp("\\t:u=(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':encodeURIComponent($1),'")

            //鏀寔UI 鍙橀噺浣跨敤鍦℉TML椤甸潰鏍囩onclick绛変簨浠跺嚱鏁板弬鏁颁腑  <%:v=value%>
            .replace(new RegExp("\\t:v=(.*?)"+_right,"g"),"',typeof($1)==='undefined'?'':baidu.template._encodeEventHTML($1),'")

            //灏嗗瓧绗︿覆鎸夌収 \t 鍒嗘垚涓烘暟缁勶紝鍦ㄧ敤'); 灏嗗叾鍚堝苟锛屽嵆鏇挎崲鎺夌粨灏剧殑 \t 涓� ');
            //鍦╥f锛宖or绛夎鍙ュ墠闈㈠姞涓� '); 锛屽舰鎴� ');if  ');for  鐨勫舰寮�
            .split("\t").join("');")

            //灏� %> 鏇挎崲涓篲template_fun_array.push('
            //鍗冲幓鎺夌粨灏剧锛岀敓鎴愬嚱鏁颁腑鐨刾ush鏂规硶
            //濡傦細if(list.length=5){%><h2>',list[4],'</h2>');}
            //浼氳鏇挎崲涓� if(list.length=5){_template_fun_array.push('<h2>',list[4],'</h2>');}
            .split(_right_).join("_template_fun_array.push('")

            //灏� \r 鏇挎崲涓� \
            .split("\r").join("\\'");

        return str;
    };

})(window);