/*******************************************************
 * cj-client-1 HTML/SPA client engine
 * May 2015
 * Mike Amundsen (@mamund)
 * Soundtrack : Complete Collection : B.B. King (2008)
 *
 * UI work
 * Benjamin Young (@bigbluehat)
 * Soundtrack : Burn the Clock : Adam Freeland (2003)
 *******************************************************/

function cj() {

  var d = domHelp();  
  var g = {};
  
  g.url = '';
  g.cj = null;
  g.ctype = "application/vnd.collection+json";

  // init library and start
  function init(url, title) {
    if(!url || url==='') {
      alert('*** ERROR:\n\nMUST pass starting URL to the Cj library');
    }
    else {
      g.url = url;
      g.title = title||"Cj Client";
      req(g.url,"get");
    }
  }

  // primary loop
  function parseCj() {
    dump();
    title();
    content();
    links();
    items();
    queries();
    template();
    error();
    cjClearEdit();
  }

  // handle response dump
  function dump() {
    var elm = d.find("dump");
    elm.innerText = JSON.stringify(g.cj, null, 2);
  }
  
  // handle title
  function title() {
    var elm, str;

    if(hasTitle(g.cj.collection)===true) {
      str = g.cj.collection.title||g.title;
      elm = d.find("title");
      elm.innerText = str;
      elm = d.tags("title");
      elm[0].innerText = str;
    }
  }

  // handle content block
  function content() {
    var elm;

    elm = d.find("content");
    d.clear(elm);
    if(g.cj.collection.content && (typeof g.cj.collection.content)==="string") {
      elm.innerHTML = g.cj.collection.content.toString(); 
    }
  }
  
  // handle link collection
  function links() {
    var elm, coll;
    var menu, item, a, img;
    var head, lnk;
    
  }

  // handle item collection
  function items() {
    var elm, coll;
    var ul, li;
    var segment, buttons, table;
    var p, img, a;

  }
  
  // handle query collection
  function queries() {
    var elm, coll;
    var segment;
    var form, fs, header, p, lbl, inp;

  }
  
  // handle template object
  function template() {
    var elm, coll;
    var form, fs, header, p, lbl, inp;

  }
  
  // handle error object
  function error() {
    var elm, obj;

    elm = d.find("error");
    d.clear(elm);
    if(g.cj.collection.error) {
      obj = g.cj.collection.error;

      p = d.para({className:"title",text:obj.title});
      d.push(p,elm);

      p = d.para({className:"message",text:obj.message});
      d.push(p,elm);

      p = d.para({className:"code",text:obj.code});
      d.push(p,elm);

      p = d.para({className:"url",text:obj.url});
      d.push(p,elm);
    }
  }

  // ***************************
  // cj helpers
  // ***************************
  
  // render editable form for an item
  function cjEdit(e) {
    var elm, coll;
    var form, fs, header, p, lbl, inp;
    var data, item, dv, tx;
    
    elm = d.find("edit");
    d.clear(elm);
    
    // get data from selected item
    item = cjItem(e.target.href);
    if(item!==null) {
      form = d.node("form");
      form.action = item.href;
      form.method = "put";
      form.className = "edit";
      form.onsubmit = httpPut;
      fs = d.node("div");
      fs.className = "ui form";
      header = d.node("div");
      header.className = "ui dividing header";
      header.innerHTML = "Edit";
      d.push(header,fs);
      
      // get template for editing
      coll = g.cj.collection.template.data;
      for(var data of coll) {
        dv = cjData(item, data.name);
        tx=(dv!==null?dv.value+"":"");
        p = d.input(
          {
            prompt:data.prompt,
            name:data.name,
            value:tx,
            required:data.requried,
            readOnly:data.readOnly,
            pattern:data.pattern,
            type:data.type,
            max:data.max,
            min:data.min,
            maxlength:data.maxlength,
            size:data.size,
            step:data.step,
            cols:data.cols,
            rows:data.rows,
            suggest:data.suggest
          },
          (g.cj.collection.related?g.cj.collection.related:null)
        );
        d.push(p,fs);
      }
      p = d.node("p");
      inp = d.node("input");
      inp.className = "ui positive mini submit button";
      inp.type = "submit";
      d.push(inp, p, fs, form, elm);
      elm.style.display = "block";
    }
    return false;
  }
  function cjClearEdit() {
    var elm;
    elm = d.find("edit");
    d.clear(elm);
    elm.style.display = "none";
    return;
  }
  function hasTitle(collection) {
    return (collection.title && collection.title.length!==-1);
  }
  function hasTemplate(collection) {
    return (
      collection.template && 
      Array.isArray(collection.template.data)===true && 
      collection.template.data.length!==0
    );
  }
  function isHiddenLink(link) {
    var rtn = false;
    if(link.render && 
      (link.render==="none" || 
       link.render==="hidden" || 
       link.rel==="stylesheet")) 
    {
      rtn = true;
    }
    return rtn;
  }
  function isReadOnly(item) {
    var rtn = false;
    if(item.readOnly && (item.readOnly==="true" || item.readOnly===true)) {
      rtn = true;
    }
    return rtn;
  }
  function isImage(link) {
    var rtn = false;
    if(link.render && (link.render==="image" || link.render==="embed")) {
      rtn = true;
    }
    return rtn;
  }
  function cjItem(url) {
    var coll, rtn;
    
    rtn = null;
    coll = g.cj.collection.items;
    for(var item of coll) {
      if(item.href.replace('http:','').replace('https:','')===
        url.replace('http:','').replace('https:','')) {
        rtn = item;
        break;
      }
    }
    return rtn;
  }
  function cjData(item,name) {
    var coll, rtn;
    
    rtn = null;
    coll = item.data;
    for(var data of coll) {
      if(data.name === name) {
        rtn = data;
        break;
      }
    }
    return rtn;
  }
  
  // ********************************
  // ajax helpers
  // ********************************
  
  // mid-level HTTP handlers
  function httpGet(e) {
    if (undefined !== e.target.href) {
      req(e.target.href, "get", null);
    }
    return false;
  }
  function httpQuery(e) {
    var form, coll, query, i, x, q;

    q=0;
    form = e.target;
    query = form.action+"/?";
    nodes = d.tags("input", form);
    for(i=0, x=nodes.length;i<x;i++) {
      if(nodes[i].name && nodes[i].name!=='') {
        if(q++!==0) {
          query += "&";
        }
        query += nodes[i].name+"="+escape(nodes[i].value);
      }
    }
    req(query,"get",null);
    return false;
  }
  function httpPost(e) {
    var form, nodes, data;

    data = [];
    form = e.target;
    nodes = d.tags("input",form);
    for(i=0,x=nodes.length;i<x;i++) {
      if(nodes[i].name && nodes[i].name!=='') {
        data.push({name:nodes[i].name,value:nodes[i].value+""});
      }
    }
    nodes = d.tags("textarea",form);
    for(i=0,x=nodes.length;i<x;i++) {
      if(nodes[i].name && nodes[i].name!=='') {
        data.push({name:nodes[i].name,value:nodes[i].value+""});
      }
    }
    nodes = d.tags("select",form);
    for(i=0,x=nodes.length;i<x;i++) {
      if(nodes[i].name && nodes[i].name!=='') {
        data.push({name:nodes[i].name,value:nodes[i].value+""});
      }
    }
    req(form.action,'post',JSON.stringify({template:{data:data}}));
    return false;
  }
  function httpPut(e) {
    var form, nodes, data;

    data = [];
    form = e.target;
    nodes = d.tags("input",form);
    for(i=0,x=nodes.length;i<x;i++) {
      if(nodes[i].name && nodes[i].name!=='') {
        data.push({name:nodes[i].name,value:nodes[i].value+""});
      }
    }
    nodes = d.tags("textarea",form);
    for(i=0,x=nodes.length;i<x;i++) {
      if(nodes[i].name && nodes[i].name!=='') {
        data.push({name:nodes[i].name,value:nodes[i].value+""});
      }
    }
    nodes = d.tags("select",form);
    for(i=0,x=nodes.length;i<x;i++) {
      if(nodes[i].name && nodes[i].name!=='') {
        data.push({name:nodes[i].name,value:nodes[i].value+""});
      }
    }
    
    req(form.action,'put',JSON.stringify({template:{data:data}}));
    return false;
  }
  function httpDelete(e) {
    if(confirm("Ready to delete?")===true) {
      req(e.target.href, "delete", null);
    }
    return false;
  }
  // low-level HTTP stuff
  function req(url, method, body) {
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function(){rsp(ajax)};
    ajax.open(method, url);
    ajax.setRequestHeader("accept",g.ctype);
    if(body && body!==null) {
      ajax.setRequestHeader("content-type", g.ctype);
    }
    ajax.send(body);
  }
  function rsp(ajax) {
    if(ajax.readyState===4) {
      g.cj = JSON.parse(ajax.responseText);
      parseCj();
    }
  }

  // export function
  var that = {};
  that.init = init;
  return that;
}

// *** EOD ***
