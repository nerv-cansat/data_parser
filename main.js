const lineReader = require('line-reader');
const XLSX = require('xlsx');
var arg = process.argv.slice(2);
var data_raw = [];
var data = [];
let converted = (data_raw.length/data.length)==2;
lineReader.eachLine('test.json', function(line, last) {
    data_raw.push(JSON.parse(line));
    if(last){
       main();
    }
});

function combineData(_callback){
    if(data_raw.length%2==1){
        console.log("Corrupt file");
    }
    else{
        for(i = 0; i<data_raw.length; i++){
            if(i%2==0){
                var result = {};
                obj1 = data_raw[i];
                obj2 = data_raw[i+1];
                Object.keys(obj1)
                .forEach(key => result[key] = obj1[key]);
    
                Object.keys(obj2)
                .forEach(key => result[key] = obj2[key]);
                data.push(result);
            }
            
        }
        _callback();  
        
    }
    
  
}

function main(){
        combineData(()=>{
            if(arg[0]=="--debug") console.log(data);
            data.forEach((element)=>{
                 dt = element.time.split('-');            //vvvv miesiąc moze byc zerowy dlatego cofka o -1
                element.time = new Date(parseInt(dt[0]), parseInt(dt[1]-1), parseInt(dt[2]), parseInt(dt[3]), parseInt(dt[4]), parseInt(dt[5])); //podaje czas UTC więc cofnięte o 1hr
            })
            
            write_xlsx();
        })
}

function write_xlsx(){
    var filename = "data.xlsx";
    var excel_data = [
        ["Time", "Temperature", "Pressure", "Voltage [V]",
         "Distance from the ground [mm]", "CO2 [ppm]", "Humidity[%]", "PM2.5 [μg/m³]", "Gas [%]",
         "Acc X [m/s]", "Acc Y [m/s]", "Acc Z [m/s]",
         "Gyro X [°/s]", "Gyro Y [°/s]", "Gyro Z [°/s]"]
    ];
    var ws_name = "CanSat";
    if(arg[0]=="--debug") console.log(excel_data);
    data.forEach((element)=>{
        excel_data.push([element.time, (element.t/100), (element.p/100), (element.v/100), element.d, element.co2, (element.h/100), (element.p25/100),(element.g/100),(element.acc.x/100), (element.acc.y/100), (element.acc.z/100), (element.gyro.x/100), (element.gyro.y/100), (element.gyro.z/100)]);
    });
    if(arg[0]=="--debug") console.log(excel_data);
    var wb = XLSX.utils.book_new(), ws = XLSX.utils.aoa_to_sheet(excel_data);
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    XLSX.writeFile(wb, filename);  
}