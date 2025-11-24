/* eslint-disable */
const { JSDOM } = require('jsdom');
const fs = require('fs');

const _modificate_patterns = {}

const _modificate_tags = {}

const _loadFile = function (source, depth) {
    const regex = /<%\s*import-html\s*=\s*"([^"]+)"\s*%>/g;
    const contents = {};
    let match;
    while (match = regex.exec(source)) {
        if(!contents[match[1]])
            contents[match[1]] = _loadFile(fs.readFileSync(match[1], 'utf8'), (depth || 0) + 1);
    }
    Object.keys(contents).forEach(k=>{
        source = source.replace(new RegExp(`<%\\s*import-html\\s*=\\s*"${k}"\\s*%>`, 'g'), contents[k]);        
    })
    return source;
}

module.exports = function (source) {
    source = _loadFile(source);
    const dom = new JSDOM(source);
    const document = dom.window.document;    

    var _fillReplica = (e)=>{
        let data = e.getAttribute('data-replicate');
        if(data.indexOf('random:') == 0){
            let s = data.substring(7).split(',');
            if(s.length != 2) return;
            data = Math.floor(Math.random() * (parseInt(s[1]) - parseInt(s[0]) + 1) + parseInt(s[0]));           
        } else data = parseInt(data);
        if(data < 1) return;
        
        let gr = e.getAttribute('data-replicate-group');
        if(!gr) gr = '';
        e.removeAttribute('data-replicate-group');
        if(gr.length > 0) gr += ':';

        e.removeAttribute('data-replicate');
        let key = 0;
        if(data > 500) data = 500;
        let pattern = e.outerHTML;
        if(data > 1){
            let div = document.createElement('div');
            while(data-- > 0){
                div.innerHTML = pattern.replaceAll('{{' + gr + 'index}}', key++).replaceAll('{{' + gr + 'step}}', key);
                e.before(div.children[0]);
            }
            e.remove();                             
        } else e.outerHTML = pattern.replaceAll('{{' + gr + 'index}}', key++).replaceAll('{{' + gr + 'step}}', key);
    }

    var _checkReplica = ()=>{
        let r = document.querySelectorAll('*[data-replicate]');
        if(r.length == 0) return;
        var d = 0;
        var el = null;
        r.forEach(e=>{ 
            let c = e.querySelectorAll('*[data-replicate]').length;  
            if(c < d) return;
            el = e; d = c;
         });
        if(el) {
            _fillReplica(el);
            _checkReplica();
        }
    }

    _checkReplica();

    Object.keys(_modificate_patterns).forEach(k=>document.querySelectorAll(`*[patt="${k}"]`).forEach(e=>{
        e.removeAttribute('patt');
        let n = _modificate_patterns[k](e, document);
        if(n) e.parentNode.replaceChild(n, e);
    }));

    Object.keys(_modificate_tags).forEach(k=>document.querySelectorAll(k).forEach(e=>{
        let n = _modificate_tags[k](e, document);
        if(n) e.parentNode.replaceChild(n, e);
    }));

    return dom.serialize();
};