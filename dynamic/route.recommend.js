(function () {
    ecui.esr.addRoute('recommend', {
        model: [
            'recommendList@/ecircle/ecircle/v1/get_recommend_list?lastCid=${recommendlastid}'
        ],
        main: 'recommend-list',
        view: 'recommend-list',
        onbeforerequest:function(context){
           var lastredom = document.getElementById("recommendList_lastcid");
           if(lastredom){
             context.recommendlastid =lastredom.getAttribute("data-cid");
           }
        }
    });
}());