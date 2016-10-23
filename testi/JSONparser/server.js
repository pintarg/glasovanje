var myMessage = '{"success": true,"counters": [{"counter_name": "dsd", "counter_type": "sds", "counter_unit": "sds" }, { "counter_name": "gdg", "counter_type": "dfd", "counter_unit": "ds" }, { "counter_name": "sdsData", "counter_type": "sds", "counter_unit": " dd " }, { "counter_name": "Stoc final", "counter_type": "number ", "counter_unit": "litri " }, { "counter_name": "Consum GPL", "counter_type": "number ", "counter_unit": "litri " }, { "counter_name": "sdg", "counter_type": "dfg", "counter_unit": "gfgd" }, { "counter_name": "dfgd", "counter_type": "fgf", "counter_unit": "liggtggggri " }, { "counter_name": "fgd", "counter_type": "dfg", "counter_unit": "kwfgf " }, { "counter_name": "dfg", "counter_type": "dfg", "counter_unit": "dg" }, { "counter_name": "gd", "counter_type": "dfg", "counter_unit": "dfg" } ] }';

var jsonData = JSON.parse(myMessage);
for (var i = 0; i < jsonData.counters.length; i++) {
    var counter = jsonData.counters[i];
    console.log(counter.counter_name);
}
