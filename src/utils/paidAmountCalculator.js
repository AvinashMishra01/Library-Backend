export const calculatePaymentStatus = (paidAmt, planAmt) => {
    let result= {status:true, due: 0};
    
    if(paidAmt<planAmt){
       result.due= planAmt - paidAmt;
       result.status= false;
       return result;
     }


  return result; // will return "2025-11-04" if start is "2025-10-05" and duration 30
};