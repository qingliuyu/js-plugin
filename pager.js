(function(){
    if(!String.prototype.format){
        String.prototype.format = function(){
            var args = arguments;
            return this.replace(/\{(\d+)\}/g, function(m, i){
                return args[i];
            });
        };
    }
})();

/**
* 使用示例如下，更多参数详见底部defaults对象
* $(".page").pagination({
*      count: 100,
*      query: { bookId: 100 }
* });
*/
(function($){
    var Pager = {
        init : function(element, options){
            var that = this;
            var pages = Math.ceil(options.count / options.size);
            if(pages <= 1) return;
            var index = 1;
            var query = that.getQuery(location.search);
            query && query.pageIndex && (index = parseInt(query.pageIndex));
            options.index = index = (index < 1 ? 1 : (index > pages ? pages : index));
            that.render(element, options, pages);
            that.selectPage(element, options, query);
        },
        render: function(element, options, pages){
            var container = $(element);
            var that = this;
            var index = options.index;
            var interval = that.getInterval(index, pages, options.showNum);
            index > 1 && that.createLink(index, index - 1 , {text: options.preText}).appendTo(container);
            if(interval.start > 1){
                that.createLink(index, 1).appendTo(container);
                interval.start > 2 && that.createLink(index, -1).appendTo(container);
            }
            for (i = interval.start; i <= interval.end; i++) {
                that.createLink(index, i, {curCss: options.curCss}).appendTo(container);
            }
            if(interval.end < pages){
                (interval.end < pages - 1) && that.createLink(index, -1).appendTo(container);
                that.createLink(index, pages).appendTo(container);
            }
            index < pages && that.createLink(index, index + 1, {text: options.nextText}).appendTo(container);
        },
        selectPage: function(element, options, query){
            var that = this;
            $(element).children("a").click(function(e){
                e.stopPropagation();
                var index = $(this).data("pageId");
                if(index.toString() === query.pageIndex) return false;
                query.pageIndex = index;
                if(options.size != 10) query.pageSize = options.size;
                location = location.pathname + "?" + $.param(query);
            });
        },
        getQuery: function(search){
            var s = search.replace(/^\?/, "");
            var args = {};
            var items = s.split("&");
            var item, name, value;
            for (var i = 0, count = items.length; i < count; i++) {
                item = items[i].split("=");
                name = decodeURIComponent(item[0]);
                value = decodeURIComponent(item[1]);
                args[name] = value;
            }
            return args;
        },
        getInterval: function(index, pages, showNum){
            var num = showNum;
            num = (num % 2) === 0 ? (num ^ 1) : num;
            var c = (num - 1) / 2;
            return {
                start: pages <= num || (index - c < 1) ? 1 : (index + c > pages) ? pages - num + 1 : index - c,
                end:pages <= num || (index + c > pages) ? pages : (index - c < 1) ? num : index + c
            };
        },
        createLink: function(index, pageId, opts){
            var link = null;
            var span = "<span>...</span>";
            var a = "<a href='javascript:void(0);' {1}>{0}</a>";
            if(pageId === -1){
                link = $(span);
            } else {
                link = $(a.format(opts && opts.text ? opts.text : pageId,
                    pageId === index && opts && opts.curCss ? "class='{0}'".format(opts.curCss) : ""));
                link.data("pageId", pageId);
            }
            return link;
        }
    };

    $.fn.pagination = function(options){
        var defaults = {
            index: 1,   // 当前页
            size: 10,   // 每页显示的数目
            count: 0,   // 记录总数
            curCss: "jh",   // 选中项的样式
            preText: "上一页",
            nextText: "下一页",
            showNum: 9, // 中间显示的页码数量，默认为9，左只显示第一页，右只显示最后一页，为求对称，值须为奇数
            query: {}   // 查询字符串 eg: {bookId: 1}
        };
        $.extend(defaults, options || {});
        return this.each(function(){
            Pager.init(this, defaults);
        })
    }
})(jQuery);
