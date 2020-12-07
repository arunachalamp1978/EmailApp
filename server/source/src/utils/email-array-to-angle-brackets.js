module.exports = (array) => {
  if(array.length > 0){
    let emails = '';
    for(let i=0; i<(array.length - 1); i++)
      emails += `<${array[i]}>, `;

    emails += `<${array[(array.length - 1)]}>`;

    return emails;
  }
  else
    return null;
};
