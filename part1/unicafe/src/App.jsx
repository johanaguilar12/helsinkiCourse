import { useState } from 'react'

const Content = (props) => <h1>{props.name}</h1>

const StatisticsLine = (props) => {
  return(
    <tr>
      <td>{props.text}</td>
      <td>{props.value}</td>
    </tr >
  )
}

const Statistics = (props) => {
  if (props.all === 0) {
    return <p>No feedback given</p>
  }

  return (
    <table>
      <tbody>
        <StatisticsLine text="good" value={props.good} />
        <StatisticsLine text="neutral" value={props.neutral} />
        <StatisticsLine text="bad" value={props.bad} />
        <StatisticsLine text="all" value={props.all} />
        <StatisticsLine text="average" value={props.average} />
        <StatisticsLine text="positive" value={props.positive} />
      </tbody>
    </table>
  )
}

const Button = (props) => (
  <button onClick={props.handleClick}>
    {props.feedback}
  </button>
)

const App = () => {
  // guarda los clics de cada botón en su propio estado
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)
  
  const all = good + neutral + bad
  const average = (all === 0 ? 0 : (good - bad) / all)

  const positive = (all === 0 ? 0 : (good / all) * 100) + '%'


  return (
    <div>
      <Content name="give feedback" />
      <Button feedback="good" handleClick={() => setGood(good + 1)} />
      <Button feedback="neutral" handleClick={() => setNeutral(neutral + 1)} />
      <Button feedback="bad" handleClick={() => setBad(bad + 1)} />

      <Content name="statistics" />
      <Statistics good={good} neutral={neutral} bad={bad} all={all} average={average} positive={positive} />
    </div>
  )
}

export default App