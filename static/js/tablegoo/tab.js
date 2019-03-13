function set_mining_tab(n){
    var tli=document.getElementById("analysis_menu").getElementsByTagName("li");
    var mli=document.getElementById("each_analysis_part").getElementsByTagName("ul");
    for(i=0;i<tli.length;i++){
        tli[i].className=i==n?"active_analysis_part":"";
        mli[i].style.display=i==n?"block":"none";
    }
}