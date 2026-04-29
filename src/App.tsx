import { useEffect, useState } from 'react';
import './App.css';

type Page = 'home' | 'calculator' | 'profiles' | 'tools' | 'settings';

type Profile = {
  name: string;
  rate: number;
  hours: number;
  otHours: number;
  diff: number;
  fedTax: number;
  stateTax: number;
  retirement: number;
  selectedState: string;
};

export default function App() {
  const [page, setPage] = useState<Page>('home');

  const [rate, setRate] = useState(36);
  const [hours, setHours] = useState(40);
  const [otHours, setOtHours] = useState(5);
  const [diff, setDiff] = useState(10);

  const [fedTax, setFedTax] = useState(12);
  const [stateTax, setStateTax] = useState(4.95);
  const [retirement, setRetirement] = useState(4);

  const [view, setView] = useState('yearly');
  const [selectedState, setSelectedState] = useState('Illinois');

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const [profileName, setProfileName] = useState('');
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState('');

  const stateRates: Record<string, number> = {
    Alabama: 5,
    Alaska: 0,
    Arizona: 2.5,
    California: 6,
    Florida: 0,
    Illinois: 4.95,
    Indiana: 3.15,
    Michigan: 4.25,
    Nevada: 0,
    Ohio: 3.5,
    Pennsylvania: 3.07,
    Tennessee: 0,
    Texas: 0,
    Wisconsin: 5.3,
  };

  useEffect(() => {
    const saved = localStorage.getItem('northforgeProfiles');
    if (saved) setProfiles(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('northforgeProfiles', JSON.stringify(profiles));
  }, [profiles]);

  const money = (num: number) =>
    num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setStateTax(stateRates[state] ?? 0);
  };

  const resetDefaults = () => {
    setRate(36);
    setHours(40);
    setOtHours(5);
    setDiff(10);
    setFedTax(12);
    setSelectedState('Illinois');
    setStateTax(4.95);
    setRetirement(4);
    setView('yearly');
  };

  const basePay = rate * hours;
  const overtimePay = rate * 1.5 * otHours;
  const differentialPay = basePay * (diff / 100);
  const grossPay = basePay + overtimePay + differentialPay;

  const deductions = grossPay * ((fedTax + stateTax + retirement) / 100);
  const takeHome = grossPay - deductions;

  const totals: Record<string, number> = {
    shift: takeHome,
    weekly: takeHome,
    biweekly: takeHome * 2,
    monthly: (takeHome * 52) / 12,
    yearly: takeHome * 52,
  };

  const totalsLabels: Record<string, string> = {
    shift: 'Per Shift',
    weekly: 'Weekly',
    biweekly: 'Biweekly',
    monthly: 'Monthly',
    yearly: 'Yearly',
  };

  const summaryText = () => `Northforge ShiftPay

${totalsLabels[view]} Take Home: ${money(totals[view])}

Rate: $${rate}
Hours: ${hours}
OT: ${otHours}
State: ${selectedState}`;

  const copySummary = async () => {
    await navigator.clipboard.writeText(summaryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const shareSummary = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Northforge ShiftPay',
        text: summaryText(),
      });
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } else {
      copySummary();
    }
  };

  const saveProfile = () => {
    if (!profileName.trim()) return;

    const next: Profile = {
      name: profileName,
      rate,
      hours,
      otHours,
      diff,
      fedTax,
      stateTax,
      retirement,
      selectedState,
    };

    const filtered = profiles.filter((p) => p.name !== profileName);
    setProfiles([...filtered, next]);
    setProfileName('');
  };

  const loadProfile = () => {
    const found = profiles.find((p) => p.name === selectedProfile);
    if (!found) return;

    setRate(found.rate);
    setHours(found.hours);
    setOtHours(found.otHours);
    setDiff(found.diff);
    setFedTax(found.fedTax);
    setStateTax(found.stateTax);
    setRetirement(found.retirement);
    setSelectedState(found.selectedState);

    setPage('calculator');
  };

  const deleteProfile = () => {
    setProfiles(profiles.filter((p) => p.name !== selectedProfile));
    setSelectedProfile('');
  };

  const clearAllProfiles = () => {
    localStorage.removeItem('northforgeProfiles');
    setProfiles([]);
    setSelectedProfile('');
  };

  const sendFeedback = () => {
    window.location.href =
      'mailto:northforgeapp@gmail.com?subject=ShiftPay Feedback';
  };

  const Stepper = ({
    label,
    value,
    setValue,
  }: {
    label: string;
    value: number;
    setValue: (v: number) => void;
  }) => (
    <>
      <label>{label}</label>
      <div className="stepper">
        <button onClick={() => setValue(Math.max(0, value - 1))}>−</button>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
        />
        <button onClick={() => setValue(value + 1)}>+</button>
      </div>
    </>
  );

  if (page === 'home') {
    return (
      <div className="dashboard">
        <h1>NORTHFORGE</h1>
        <div className="dashboard-grid">
          <button onClick={() => setPage('calculator')}>Calculator</button>
          <button onClick={() => setPage('profiles')}>Profiles</button>
          <button onClick={() => setPage('tools')}>More Tools</button>
          <button onClick={() => setPage('settings')}>Settings</button>
        </div>
      </div>
    );
  }

  if (page === 'profiles') {
    return (
      <div className="app">
        <button onClick={() => setPage('home')}>← Back</button>

        <h2>Profiles</h2>

        <input
          value={profileName}
          onChange={(e) => setProfileName(e.target.value)}
          placeholder="Profile Name"
        />

        <button onClick={saveProfile}>Save</button>

        <select
          value={selectedProfile}
          onChange={(e) => setSelectedProfile(e.target.value)}
        >
          <option value="">Select</option>
          {profiles.map((p) => (
            <option key={p.name}>{p.name}</option>
          ))}
        </select>

        <button onClick={loadProfile}>Load</button>
        <button onClick={deleteProfile}>Delete</button>
      </div>
    );
  }

  if (page === 'tools') {
    return (
      <div className="app">
        <button onClick={() => setPage('home')}>← Back</button>

        <h2>More Tools</h2>

        <button>🔥 Overtime Split Calculator</button>
        <button>🎯 Income Goal Tool</button>
        <button>⚖️ Shift Compare Tool</button>

        <hr />

        <button disabled>💳 Debt Tool (Soon)</button>
        <button disabled>📈 Retirement Tool (Soon)</button>
      </div>
    );
  }

  if (page === 'settings') {
    return (
      <div className="app">
        <button onClick={() => setPage('home')}>← Back</button>

        <h2>Settings</h2>

        <button>🌙 Dark Mode</button>
        <button disabled>✨ Gold Mode (Soon)</button>

        <button onClick={resetDefaults}>Reset Calculator</button>
        <button onClick={clearAllProfiles}>Reset Profiles</button>

        <button onClick={sendFeedback}>Send Feedback</button>

        <p>Northforge ShiftPay v1.0 Alpha</p>
      </div>
    );
  }

  return (
    <div className="app">
      <button className="action-btn" onClick={() => setPage('home')}>
        ← Back
      </button>

      <div className="brand">
        <h1>NORTHFORGE SHIFTPAY</h1>
      </div>

      <div className="results">
        <p className="total final-total">
          <span>Estimated {totalsLabels[view]}</span>
          <span>{money(totals[view])}</span>
        </p>
      </div>

      <div className="card">
        <Stepper label="Hourly Rate" value={rate} setValue={setRate} />
        <Stepper label="Regular Hours" value={hours} setValue={setHours} />
        <Stepper label="OT Hours" value={otHours} setValue={setOtHours} />
        <Stepper label="Shift Diff %" value={diff} setValue={setDiff} />

        <label>Quick Hours</label>
        <div className="tabs">
          <button onClick={() => setHours(40)}>40 hrs</button>
          <button onClick={() => setHours(48)}>48 hrs</button>
          <button onClick={() => setHours(60)}>60 hrs</button>
          <button onClick={() => setOtHours(0)}>Zero OT</button>
        </div>

        <hr />

        <Stepper label="Fed Tax %" value={fedTax} setValue={setFedTax} />

        <label>Select State</label>
        <select
          className="state-select"
          value={selectedState}
          onChange={(e) => handleStateChange(e.target.value)}
        >
          {Object.keys(stateRates)
            .sort()
            .map((state) => (
              <option key={state}>{state}</option>
            ))}
        </select>

        <Stepper label="State Tax %" value={stateTax} setValue={setStateTax} />

        <Stepper
          label="Retirement %"
          value={retirement}
          setValue={setRetirement}
        />

        <button className="action-btn" onClick={resetDefaults}>
          Reset Defaults
        </button>

        <button className="action-btn" onClick={shareSummary}>
          {shared ? 'Shared ✓' : 'Share Pay Summary'}
        </button>

        <button className="action-btn" onClick={copySummary}>
          {copied ? 'Copied ✓' : 'Copy Pay Summary'}
        </button>
      </div>

      <div className="results">
        <h2>Breakdown</h2>

        <p>
          <span>Base Pay</span>
          <span>{money(basePay)}</span>
        </p>

        <p>
          <span>Overtime Pay</span>
          <span>{money(overtimePay)}</span>
        </p>

        <p>
          <span>Differential</span>
          <span>{money(differentialPay)}</span>
        </p>

        <p>
          <span>Gross Pay</span>
          <span>{money(grossPay)}</span>
        </p>

        <p>
          <span>Deductions</span>
          <span>{money(deductions)}</span>
        </p>

        <p className="total">
          <span>Take Home</span>
          <span>{money(takeHome)}</span>
        </p>

        <hr />

        <div className="tabs">
          {['shift', 'weekly', 'biweekly', 'monthly', 'yearly'].map((item) => (
            <button
              key={item}
              className={view === item ? 'active' : ''}
              onClick={() => setView(item)}
            >
              {totalsLabels[item]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}