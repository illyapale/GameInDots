import React, {Component} from 'react';
import axios from 'axios';

class Game extends Component {
    
    state = {
        data: '',
        user: '',
        mode: '',
        openTable: false,
        status: 0,
        count: 0,
        systemCount: 0,
        fields: 0,
        delay: '',
        interval: 0,
        message: '',
        leadBoard: '',
        endGame: false
    };
    
    componentDidMount() {
        let url = 'http://starnavi-frontend-test-task.herokuapp.com/';
        
        axios.get(url + 'game-settings')
            .then(response => {
                this.setState({...this.state, data: response.data})
            })
            .catch(err => console.error(err));

        axios.get(url + 'winners')
            .then(response => {
                this.setState({...this.state, leadBoard: response.data});
            })
            .catch(err => console.error(err))

    }

    generateDate = () => {
        const date = new Date();

        let dd = date.getDate();
        if (dd < 10) dd = '0' + dd;

        let mm = date.getMonth() + 1;
        if (mm < 10) mm = '0' + mm;

        let yy = date.getFullYear() % 100;
        if (yy < 10) yy = '0' + yy;

        let min = date.getMinutes();
        if(min < 10) min = '0' + min;

        let hour = date.getHours();
        if(hour < 10) hour = '0' + hour;

        return hour + ':' + min + '; ' + dd + '.' + mm + '.' + yy;
    };
    
    setModeOptions() {
        let data = Object.keys(this.state.data);
        
        return data.map((item, index) => {
            return (
                <option value={item} key={index}>{item}</option>
            )
        })
    }
    
    setLeadBoard() {
        if(this.state.leadBoard.length !== 0) {
            return this.state.leadBoard.map((item) => {
                return (
                    <div className='leader-item' key={item.id}>
                        <span>{item.winner}</span>
                        <span>{item.date}</span>
                    </div>
                )
            })
        }
    }

    setUser = (event) => {
        this.setState({...this.state, user: event.target.value})
    };
    
    setMode = (event) => {
        this.setState({...this.state, mode: this.state.data[event.target.value]})
    };
    
    play = () => {
        if(this.state.user.length !== 0 && this.state.mode.length !== 0) {
            this.setState(
                {
                    ...this.state, 
                    openTable: true, 
                    fields: Object.values(this.state.mode)[0], 
                    delay: Object.values(this.state.mode)[1]
                }, 
                this.initGame
            );
        }
    };

    playAgain = () => {
        window.location.reload();
    };
    
    initGame = () => {
        let interval = setInterval(
            this.randomCell, 
            this.state.delay
        );
        
        this.setState({interval: interval});
    };
    
    randomCell = () => {
        let cells = [],
            allCells = [];
        
        for (let id in this.refs) {
            if(!this.refs.hasOwnProperty(id)) {
                continue;
            }
            
            let item = this.refs[id],
                type = item.getAttribute('datatype');
            
            allCells.push(id);
            
            if(type === '0' && item.classList.contains('active')) {
                item.setAttribute('datatype', 1);
                item.classList.remove('active');
                item.classList.add('system');
                this.setState({systemCount: this.state.systemCount + 1});
                continue;
            }
            
            if(type !== '0') {
                continue;
            }
            
            cells.push(item);
        }
        
        if(cells.length < allCells.length / 2) {
            clearInterval(this.state.interval);
            this.endGame();
            return false;
        }
        
        let rand = Math.floor(Math.random() * cells.length),
            activeItem = cells[rand];

        activeItem.classList.add('active');
    };
    
    chooseCell = (event) => {
        let elem = event.target;

        if(elem.classList.contains('active') && elem.getAttribute('datatype') === '0') {
            elem.classList.remove('active');
            elem.classList.add('user');
            elem.setAttribute('datatype', 2);
            this.setState({count: this.state.count + 1});
        }
    };
    
    endGame = () => {
        let url = 'http://starnavi-frontend-test-task.herokuapp.com/';
        
        if(this.state.systemCount > this.state.count) {
            this.setState({message: "You lose"});
            
            let body = JSON.stringify({
                id: Math.random(),
                winner: 'Computer',
                date: this.generateDate()
            });
            
            axios.post(url + 'winners', body, {
                headers : {
                    "Content-Type" : 'application/json'
                }
            })
                .then(response => {
                    if(response.status === 200) {
                        this.setState(
                            {
                                message: "Computer win", 
                                endGame: true, 
                                leadBoard: [...this.state.leadBoard, JSON.parse(body)]
                            }
                        );
                    }
                })
                .catch(err => console.error(err));
            return false;
        }
        
        if(this.state.systemCount < this.state.count) {

            let body = JSON.stringify({
                id: Math.random(),
                winner: this.state.user,
                date: this.generateDate()
            });

            axios.post(url + 'winners', body, {
                headers : {
                    "Content-Type" : 'application/json'
                }
            })
                .then(response => {
                    if(response.status === 200) {
                        this.setState(
                            {
                                message: `${this.state.user} win`, 
                                endGame: true, 
                                leadBoard: [...this.state.leadBoard, JSON.parse(body)]
                            }
                            );
                    }
                })
                .catch(err => console.error(err));
            
            return false;
        }
    };
    
    gameTable() {
        let fields = [],
            i = 0;
        
        for(let i = 1; i <= this.state.fields; i++) {
            fields.push(i)
        }
        
        return fields.map((item) => {
            return (
                <tr key={item}>
                    {fields.map(() => {
                        i++;
                        return (
                            <td key={i} datatype='0' onClick={this.chooseCell} ref={i}/>
                        ) 
                    })}
                </tr>
            )
        });
    }

    
    render() {
        return (
            <div className='container'>
                <div className='game-board'>
                    <div className='menu'>
                        <select name="mode"  onChange={this.setMode} className='dropdown'>
                            <option value="default">Pick game mode</option>
                            {this.setModeOptions()}
                        </select>
                        <input type="text" name='user' placeholder='Enter your name' onChange={this.setUser} className='input'/>
                        {
                            !this.state.endGame ? <button onClick={this.play} className='button'>Play</button> : <button onClick={this.playAgain} className='button'> Play again</button>    
                        }
                        
                    </div>
                    <div className='message'>{this.state.message}</div>
                    {
                        this.state.openTable &&
                        <div className='table-container'>
                            <table width="70%" border="1" className='table'>
                                <tbody>
                                {this.gameTable()}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
                <div className="leader-board">
                    <span>Leader Board</span>
                    <div className='leaders'>
                        {this.setLeadBoard()}
                    </div>
                </div>
           
            </div>
        )
    }
}

export default Game