({
    init: function(cmp) {
        var source = cmp.get('v.source');
        console.info('init');
        if(typeof source === 'object') {
            console.info('stringify')
            source = JSON.stringify(source, null, '  ');
            cmp.set('v.source', source);
        }

        var preview = source.split('\n').slice(0, 40).join('\n');
        cmp.set('v.preview', preview);
        cmp.set('v.longSource', source.split('\n').length > 40);
        cmp.set('v.size', this.niceBytes(source.length));
    },
    copySource: function(cmp) {
        var source = cmp.get('v.source');
        var copyDataToClipboard = (e) => {
            e.preventDefault();
            e.clipboardData.setData("text/plain", source);
        }
        document.addEventListener("copy", copyDataToClipboard);
        try {
            document.execCommand("copy");
        } catch (exception) {
            console.error("Copy to clipboard failed");
        } finally {
            document.removeEventListener("copy", copyDataToClipboard);
        }
    },
    toggleSourceView: function(cmp) {
        cmp.set('v.full', !cmp.get('v.full'));
    },  
    niceBytes: function(x) {
        const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
        if(x === 1) return '1 byte';

        let l = 0, n = parseInt(x, 10) || 0;

        while(n >= 1024 && ++l){
            n = n/1024;
        }
        //include a decimal point and a tenths-place digit if presenting 
        //less than ten of KB or greater units
        return(n.toFixed(n < 10 && l > 0 ? 1 : 0) + ' ' + units[l]);
    },
    download: function(cmp) {
        var source = cmp.get('v.source');
        var name = cmp.get('v.name');
        var file = new File([source], name, {type: "text/plain"});
        saveAs(file);
    },
    dataUrlToBlob: function(data) {
        var mx= data.length,
            i= 0,
            myBlob = (window.Blob || window.MozBlob || window.WebKitBlob || toString),
            uiArr= new Uint8Array(mx);

        for(i;i<mx;++i) uiArr[i]= data.charCodeAt(i);

        return new myBlob([uiArr], {type: 'text/html'});
    }
})