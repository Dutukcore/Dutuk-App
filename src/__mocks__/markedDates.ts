const markedDatesDummy = {


    events:[{
        dates:['2025-07-02','2025-07-03','2025-07-04','2025-07-05'],
        message:"Birthay Event For Sarah",
    },{
       dates:['2025-07-08','2025-07-09','2025-07-10'],
        message:"FareWell Party For Sharvesh", 
    }],
        period:{
        '2025-07-02':{color:"red",startingDay:true},
        '2025-07-03':{color:"red"},
        '2025-07-04':{color:"red"},
        '2025-07-05':{color:"red",endingDay:true},
        '2025-07-08':{color:"red",startingDay:true},
        '2025-07-09':{color:"red"},
        '2025-07-10':{color:"red",endingDay:true}
    }
};         
export default markedDatesDummy;