function requestBoysHeights (callback) {
    const heights = [175, 181, 165, 190, 166];
    setTimeout(()=> callback(heights), 3*1000);
};


function requestGirlsHeights (callback) {
    const heights = 0.5 < Math.random()? [156, 164, 171, 160, 178]: null;
    setTimeout(()=> callback(heights), 1*1000);
};


function retry(n, requestFunction, callback) {
    requestFunction( heights => {
        if ( !heights ) { retry(n+1, requestFunction, callback); }
        else { callback(n, heights); }
    
  });
}


function run (callback) {
    console.log('start');
    callback();
};


run(()=>  {
  requestBoysHeights( (heights1) => {
      retry(0, requestGirlsHeights, (n, heights2)=> {
          console.log('retry cnt:', n);
          console.log('boys heights:', heights1);
          console.log('girls heights:', heights2);
          console.log('end');
      });
    });
});