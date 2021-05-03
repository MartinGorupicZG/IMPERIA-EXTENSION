

function calculatepercent(amToSell,price,comm,fix){
    var amount = amToSell;
    var pr = price;
    var comis = comm;
    var resultat3;
    var recive;
    var recivePU;
	var fix_comis=fix;
    
    var resultat2 = price * amount;
        resultat2 = Math.round(resultat2*100)/100;
    var resultat = Math.round((resultat2 * fix_comis)/100);
    
    
    
    if(comis!=0){
    	resultat3 = Math.round((resultat2 * comis) /100);
    	recive = resultat2 - resultat3;
    	recive = Math.round(recive*100)/100;
    }else{
    	resultat3=0;
    	recive = resultat2;
    	recive = Math.round(recive*100)/100;
    }
    
    var substractFixCommision = 0;
    
    if(resultat > 0){
        substractFixCommision = resultat;
    	document.getElementById('comission').innerHTML="-" + number_format(resultat, 0, ".", "&nbsp;");
    }else{
    	document.getElementById('comission').innerHTML=0;
    }
    var posibleProfit = (recive-substractFixCommision);
    recivePU = posibleProfit/amount;
	recivePU = Math.round(recivePU*100)/100;
    
    if(posibleProfit > 0){
    	document.getElementById('oneUnit').innerHTML=number_format(posibleProfit, 0, ".", "&nbsp;");
    }else{
    	document.getElementById('oneUnit').innerHTML=0;
    }
    if(resultat3 > 0){
    	document.getElementById('marketcommision').innerHTML="-" + number_format(resultat3, 0, ".", "&nbsp;");
    
    }else{
    	document.getElementById('marketcommision').innerHTML=0;
    
    }
    if(recive>0){
        document.getElementById('recive').innerHTML=number_format(recive, 0, ".", "&nbsp;");
    	document.getElementById('recivePerUnit').innerHTML = number_format(recivePU, 2, ".", "&nbsp;");
    }else{
    	document.getElementById('recive').innerHTML=0;
    	document.getElementById('recivePerUnit').innerHTML = 0;
    }
}

function IsNumeric2(sText){
	var ValidChars = "0123456789.";
	var IsFirst=true;
	var Char;
	var z='';
	var timesError=0;
	var pointFound=0;
	for (i = 0; i < sText.length; i++){
		Char = sText.charAt(i);
		if (ValidChars.indexOf(Char) == -1){
			if((timesError==0)&&(pointFound==0)){
				if(i==0){z='0';}
				z=z + ".";
				timesError++;
			}
		}else{
			if(((pointFound==0)&&(Char=='.'))||(Char!='.')){
				if((i==0)&&(Char=='.')){z='0';}
				if(Char=='.'){pointFound=1;}
				z=z + sText.charAt(i);
			}
		}
	}
	if(z == '') {
		z = '';
	} else if (z.toString().length > 1 && z.toString().charAt(1) != '.' && parseFloat(z) <= 0) {
		z = 0;
	}
	
	return z;
}

function IsNumeric(sText){
var ValidChars = "0123456789";
var IsFirst=true;
var Char;
var z='';

for (i = 0; i < sText.length; i++)
	  {
	  Char = sText.charAt(i);

	  if (ValidChars.indexOf(Char) == -1)
		 {

		 }else{
				 z=z + sText.charAt(i);
		 }
	  }
	if(z == '') {
		z = '';
	} else {
		z = parseInt(z, 10);
	}
	return z;
}


function calculate(amToBuy){

	var tmpSum=0;
	var tmpAm=0;
	if(amToBuy>0){
		tmpAm=amToBuy;

		for(i=0;(i<tradeAmArray.length && tmpAm!=0);i++){
			z=tradeAmArray[i];
//			alert(z);
//			alert(tmpAm);
			if (tmpAm>z){tmpSum=tmpSum+z*pr[i];tmpAm=tmpAm-z;}
			else{tmpSum=tmpSum+tmpAm*pr[i];tmpAm=0;}
		}
	}

	if((tmpSum/amToBuy<0)||(amToBuy==0)){
		resultat=pr[0];resultat2=0;
	}else{
		if(tmpAm>0){
			resultat="none";resultat2="none";
		}else{
			resultat=tmpSum/amToBuy;resultat=Math.round(resultat*100)/100;
			resultat2=Math.round(tmpSum);
		}
	}
//	alert(resultat);
	document.getElementById('result').innerHTML=resultat;
	document.getElementById('result2').innerHTML=resultat2;
}
