const Assignment = require("../models/assignmentModel"); // Assuming your user model is exported as User
const {fetchTextData,compareStrings} = require ("../functions/fetchTextFromUrl.js");
const {bakersDup} = require ("../functions/plagiagrismFunc.js");

const Axios = require('axios');
const User = require("../models/userModel.js");

class AssigmentController {
    async addNewAssignment(assignment) {
        try {
            const newAssignment = new Assignment({
                title: assignment.title,
                question: assignment.question,
                startTime: assignment.startTime,
                endTime: assignment.endTime,
                penaltyTime: assignment.penaltyTime,
                language:assignment.language,
                testCases:[],
                creator_roll: assignment.roll_no,
                submissions: [] // Initialize submissions as an empty array
            });
            assignment.testCases.forEach((item)=>{
                newAssignment.testCases.push({"input":item.name,"output":item.link});
            })
            await newAssignment.save();
            for (const range of assignment.users) {
                const start = Number(range.name);
                const end = Number(range.link);
                for (let roll_no = start; roll_no <= end; roll_no++) {
                    try {
                        const user = await User.findOne({ rollNumber: roll_no, role: 0 });
                        if (user) {
                            user.assignments.push(newAssignment._id);
                            await user.save();
                        } else {
                            console.log(`User with roll number ${roll_no} not found or not matching role.`);
                        }
                    } catch (error) {
                        console.error(`Error assigning assignment to user with roll number ${roll_no}: ${error.message}`);
                    }
                }
            }
            return newAssignment._id;
        } catch (err) {
            throw new Error(err);
        }
    }
        async checkAssignments(assignment_id) {
            try {
                const currAssignment=await Assignment.findById(assignment_id)
                const submissions=currAssignment.submissions
                const testCases=currAssignment.testCases
                const language=currAssignment.language
                const testCaseSize=testCases.length
                var newSubmissions=submissions;
                var stringArr=[]
                for (const submission of submissions)
                {
                    const file=submission.file
                    const convertedFile=await fetchTextData(file)
                    stringArr.push(convertedFile)
                    var a=0.00;
                    for(const testCase of testCases)
                    {

                        const response=await this.checkCode({code:convertedFile,language:language,input:testCase.input,output:testCase.output})
                        console.log(response+" "+testCase.output)
                      if(compareStrings(response,testCase.output))
                      {a++;
                        console.log("correct")
                      }


                }
                var marks=(a/testCaseSize)*100;
                newSubmissions=newSubmissions.filter(msg=>msg.rollNumber!==submission.rollNumber)
                var nextSubmission=submission
                nextSubmission.marks=marks;
                newSubmissions.push(nextSubmission)
                console.log(marks)
            }

            const checkedAssignments =await this.checkPlagiarism(newSubmissions,stringArr)

            currAssignment.submissions=checkedAssignments

 

            await currAssignment.save()

            


            //await newAssignment.save();

            return currAssignment;
        } catch (err) {
            throw new Error(err);
        }
    }
        async checkPlagiarism(newAssignments,stringArr) {
            try {
                
                var assignments=newAssignments;
                const language=newAssignments[0].language
             
                    for (let i = 0; i < submissions.length-1; i++) {
                      
                        var cheated=false;
                    
                        for (let j = i+1; j < submissions.length; j++) {
                
                            cheated=bakersDup(stringArr[i],stringArr[j],language);
                            if(cheated===true)
                            {
                                assignments[i].marks=0;
                                break;
                            }


                            // Your inner loop logic here...
                        }

                    
                    }
                
             
                

    
                //await newAssignment.save();
    
                return assignments;
            } catch (err) {
                throw new Error(err);
            }
        }

    async checkCode(details) {
        try {
            let code = details.code; 
            let language = details.language; 
            let input = details.input; 
            console.log(code+" "+ language+" "+ input)
            if (language === "Python") { 
                language = "python3"
            }
            if (language === "C++") { 
                language = "cpp"
            }
            if (language === "Dart") { 
                language = "dart"
            }
            if (language === "PHP") { 
                language = "php"
            }
            if (language === "SQL") { 
                language = "sql"
            } 
          
            let data3 = { 
                language: language, 
                version: 'latest',
                code: code, 
                input: input,
            }; 
            const options = {
                method: 'POST',
                url: 'https://online-code-compiler.p.rapidapi.com/v1/',
                headers: {
                  'content-type': 'application/json',
                  'X-RapidAPI-Key': 'ad8530c212msh65c2725baaea14ep122618jsn181f4d03edbc',
                  'X-RapidAPI-Host': 'online-code-compiler.p.rapidapi.com'
                },
                data : data3
              };

              const response = await Axios(options);
              // Return the output if the request was successful
              
              return response.data.output;
         
            
        } catch (err) {
            throw new Error(err);
        }
    }
    
        async addSubmission(submission, assignment_id) {
            try {
                const currAssignment = await Assignment.findById(assignment_id);
                if (!currAssignment) {
                    throw new Error("Assignment not found");
                }
        
                // Check if there is already a submission with the same rollNumber
                if (currAssignment.submissions.findIndex(sub => sub.rollNumber.toString() === submission.rollNumber.toString()) !== -1) {
                    throw new Error('Already submitted');
                }
                
                
                // Proceed with adding the submission
                currAssignment.submissions.push(submission);
                console.log("Submission added successfully.");
        
                // Save the updated assignment object
                await currAssignment.save();
                console.log("Assignment updated with new submission.");
                return "Submission added successfully"; // Returning a message could be useful for API responses
            } catch (error) {
                console.error('Error:', error.message);
                throw new Error(error.message); // Pass only the message if needed, or just rethrow
            }
        }
           
        async getAssignments(id) {
            try {
                var currAssignment = await Assignment.findById(id);
                if (!currAssignment) {
                 throw new Error("Assignment not found");
             }
    
                return currAssignment;
            } catch (err) {
                throw new Error(err);
            }
        }

        async checkSubmission(id) {
            try {

               
               var currAssignment = await Assignment.findById(id);
               if (!currAssignment) {
                throw new Error("Assignment not found");
            }
                
    
                return currAssignment;
            } catch (err) {
                throw new Error(err);
            }
        }


    
    }

    module.exports = AssigmentController;
