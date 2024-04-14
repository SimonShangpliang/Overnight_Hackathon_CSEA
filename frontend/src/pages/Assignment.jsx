import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Assignment.css';

function Assignment() {
  const navigate = useNavigate();
  const { id } = useParams(); // Directly use this ID
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [pageData, setPageData] = useState({ title: "", creator_roll: "", question: "", startTime: "" });
  const [roll_no, setRollNo] = useState(220101018);
//   const [assignment_id, setAssId] = useState();
  const [role, setRole] = useState(0);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(user);
    if (!parsedUser || !parsedUser.rollNumber) {
      navigate("/login");
      return;
    }
    console.log(parsedUser);
    setRole(Number(parsedUser.role));
    setRollNo(Number(parsedUser.rollNumber));
    console.log(role);
    console.log(roll_no);
    const fetchAssignment = async () => {
        
      try {
        const response = await fetch(`http://localhost:8080/assignment/getAssignments/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch assignment details');
        }

        const data = await response.json();
        setPageData(data);
      } catch (error) {
        console.error('Error:', error);
        alert('Error Fetching assignment');
      }
    };

    fetchAssignment();
  }, [id, navigate]);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (file) {
      uploadFile(file);
    }
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append("roll_no", roll_no);
    formData.append("assn_id", id);

    try {
      const response = await fetch('http://localhost:8080/assignment/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      if(data.url){
      setMessage('File uploaded successfully: ' + data.url);
    }
    else{
          setMessage('Already Submitted');
      }
      setFileName(''); // Clear filename after successful upload
      setFile(null); // Clear file object
    } catch (error) {
      setMessage('Upload failed: ' + error.message);
    }
  };







    
    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setFileName(e.target.files[0].name);
        setMessage('');
    };

    

    return (
        <div className="upload-container">
            <div className="assignment-show">
                <h1>               { pageData.title}
</h1>
                <div className="question">
               { pageData.question}

                </div>
            </div>
            <h2>File Submission</h2>

            {role === 0 && (

            <div className="submission">
            <form onSubmit={handleUpload}>
                <input type="file" id="file-input" style={{ display: 'none' }} onChange={handleFileChange} />
                <label htmlFor="file-input" className="btn-attach">Attach File</label>
                {fileName && <span className="file-name">{fileName}</span>}
                <button type="submit" className="btn-hand-in">Hand In</button>
            </form>

            {message && <p>{message}</p>}
        </div>)}
        {role === 1 && (
    <div id="persons">
        {pageData.submissions?.map((data) => (
            <div>
            <div
                key={data.rollNumber}
                className="person"
                onClick={() =>{} }
            >
            <div>
                {data.rollNumber}
                </div>
                <div >
            <p>Marks :{data.marks}</p>
            
                </div>
            </div>
            
                </div>
        ))}
    </div>
)}


        </div>
    );
}

export default Assignment;
