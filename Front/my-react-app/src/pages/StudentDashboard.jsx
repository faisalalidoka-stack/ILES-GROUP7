import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import {getUser, logOut, getWeeklyLogs, getPlacements} from '../services/api';

function StudentDashboard() 
{
    const navigate = useNavigate();
    const user = getUser();
    const [logs, setLogs] = useState([]);
    const [placements, setPlacements] = useState([null]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        //if not logged in go back to login page
        if (!user) {
            navigate('/');
            return;
        }

        //fetch data when the when component is mounted
        async function loadData() {
            try {
                const [logsData, placementsData] = await Promise.all([
                    getWeeklyLogs(),
                    getPlacements(),
                ]);
                setLogs(logsData);
                setPlacements(placementsData[0] || null); //meaning the student has only one placement

            } catch (err) {
                setError('Failed to load data. Please try again');
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []); //the empty list means return onnce when the component is mounted


    const handleLogout = () => {
        logOut();
        navigate('/');}

    if (loading) return <p style={{padding:'2rem'}}>Loading...Please give us few minutes</p>;
    if (error) return <p style={{padding:'2rem', color:'red'}}>{error}</p>;

    return (
        <div style={{padding:'2rem', fontfamily: 'Arial, sans-serif'}}>
            {/* Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
                <h2 sytle={{color: '1a2d52'}}>
                    Welcome, {user.email}
                </h2>
                <button onClick={handleLogout}
                style={{padding: '8px 16px', background:'#e07b39',
                    color:'white', border:'none', borderRadius:'6px',
                    cursor:'pointer'
                }}>

                </button>
            </div>
            {/* Placement card*/}
            {placements ? (
                <div style={{background: '#eef4f7', borderRadius: '8px',
                    padding: '1rem', marginBottom: '1.5rem'}}>
                    <h3 style={{margin:0, color:'#0d7c8f'}}>My Placement</h3>
                    <p><b>Company:</b>{placements.company_name}</p>
                    <p><b>Status:</b>{placements.status}</p>
                    <p><b>Start:</b>{placements.start_date}</p>
                    <p><b>End:</b>{placements.end_date}</p>    

                </div>
                ) : (
                    <p style={{color:'#888'}}>No placement assigned yet.</p>

                )
                }

                {/*The weekly logs table */}
                <h3 style={{color:'#1a2d52'}}>My Weekly Logs ({logs.length})</h3>
                {logs.length === 0 ? (
                    <p style={{color:'#888'}}>No logs yet. Please submit your first log</p>
                ) : (
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                            <tr style={{background:'#1a2d52', color:'white'}}>
                                <th style={{padding:'10px'}}>Week</th>
                                <th style={{padding:'10px'}}>Tasks</th>
                                <th style={{padding:'10px'}}>Hours</th>
                                <th style={{padding:'10px'}}>Status</th>



                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                            <tr key={log.id}
                                style={{borderBottom:'1px solid #ddd',
                                    background: log.status ==='Approved'?'#d4edda':
                                                log.status ==='Rejected'?'#f8d7da':'white'  
                                }}>
                                <td style={{padding:'10px', textAlign:'center'}}>{log.week}</td>
                                <td style={{padding:'10px'}}>{log.task ? log.task.slice(0,60)+"...": "No description provided"}</td>
                                <td style={{padding:'10px', textAlign:'center'}}>{log.hours}</td>
                                <td style={{padding:'10px', textAlign:'center'}}>
                                    <span style={{padding:'4px 10px', borderRadius:'12px',
                                        background:log.status==='Approved'?'#28a745':
                                                log.status==='Rejected'?'#dc3545':'#6c757d',
                                        color:'white', fontSize:'12px'           

                                    }}>
                                    {log.status}

                                    </span>
                                </td>


                            </tr>))}
                        </tbody>
                    </table>
                )}
        </div>    
    );
}

export default StudentDashboard;


