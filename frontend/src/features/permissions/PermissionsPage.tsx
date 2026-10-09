import { useEffect, useMemo, useState } from "react";

import type { Capability } from "../../lib/permissions";
import { ROLE_LABELS } from "../../lib/permissions";
import type { PermissionsData } from "./api";
import { fetchPermissions, savePermissions } from "./api";

/**
 * How each capability reads to a person, grouped the way somebody thinks about
 * the work rather than the way the code is organised.
 *
 * Every entry says what the associate would be able to DO, in the words used
 * elsewhere in the interface — "Archivar lotes", not "lot:archive".
 */
const GROUPS: Array<{
  title: string;
  description: string;
  items: Array<{ capability: Capability; label: string; hint?: string }>;
}> = [
  {
    title: "Lots",
    description: "Land inventory.",
    items: [
      { capability: "lot:create", label: "Create lots" },
      { capability: "lot:edit", label: "Edit lots" },
      {
        capability: "lot:archive",
        label: "Archive lots",
        hint: "Removes them from the active inventory; nothing is deleted.",
      },
    ],
  },
  {
    title: "Projects",
    description: "Developments that group lots.",
    items: [
      { capability: "project:create", label: "Create projects" },
      { capability: "project:edit", label: "Edit projects and their area units" },
      { capability: "project:archive", label: "Archive projects" },
    ],
  },
  {
    title: "Customers and contracts",
    description: "Day-to-day work.",
    items: [
      { capability: "customer:create", label: "Add customers" },
      { capability: "customer:edit", label: "Edit customers" },
      {
        capability: "customer:delete",
        label: "Delete customers",
        hint: "Only customers who have never had a contract. A reason is required.",
      },
      { capability: "contract:create", label: "Create contracts and reservations" },
      {
        capability: "contract:edit",
        label: "Edit contract terms",
        hint:
          "Term, installment, payment day, dates, and notes. A reason is required because this " +
          "changes the signed agreement. The sale price is managed separately.",
      },
      {
        capability: "contract:reprice",
        label: "Change a contract's sale price",
        hint:
          "Changes what the customer owes. This can be granted separately from editing terms: " +
          "changing a payment day and changing a balance require different levels of trust.",
      },
      {
        capability: "contract:reassign_lot",
        label: "Correct a contract's lot",
        hint:
          "Only for correcting a lot entered by mistake: the contract moves to another lot and " +
          "keeps its payments. To sell another lot, create a new contract. A reason is required.",
      },
      {
        capability: "contract:amend",
        label: "Record amendments",
        hint:
          "Record a new agreement for active contracts: the old contracts are marked as " +
          "replaced, with payments and receipts intact, and new contracts are created with the " +
          "new price and term. A reason is required.",
      },
      {
        capability: "contract:cancel",
        label: "Cancel contracts",
        hint: "Releases the lot and keeps the contract in the activity history.",
      },
    ],
  },
  {
    title: "Money",
    description: "These actions affect balances. Consider carefully before granting them.",
    items: [
      { capability: "payment:record", label: "Record payments" },
      {
        capability: "payment:reverse",
        label: "Reverse payments and void receipts",
        hint:
          "A reversal keeps the original payment visible but stops it from counting. It does " +
          "not change the amount; that is a separate action.",
      },
      {
        capability: "payment:edit",
        label: "Correct a recorded transaction",
        hint:
          "Replaces a payment's amount or date instead of reversing it. The previous value " +
          "remains only in the activity history, so this requires more trust than a reversal. " +
          "A reason is required.",
      },
      {
        capability: "price:change",
        label: "Change the price of a lot with a contract",
        hint: "A reason is required and saved in the activity history.",
      },
      {
        capability: "rate:edit",
        label: "Change the exchange rate",
        hint: "Only affects what is shown on screen, never a balance.",
      },
    ],
  },
  {
    title: "Control",
    description: "Review activity in the system.",
    items: [
      {
        capability: "audit:view",
        label: "View activity history",
        hint: "Who changed what, when, and why.",
      },
    ],
  },
];

interface PermissionsPageProps {
  /** Called after a successful save, so the app can re-read its own session. */
  onSaved: () => void;
}

/**
 * The supervisor's switchboard for what the associate role may do.
 *
 * Per ROLE, not per person: every associate account follows these switches, so
 * a new hire is governed by the same rules without anybody configuring them.
 */
export function PermissionsPage({ onSaved }: PermissionsPageProps) {
  const [data, setData] = useState<PermissionsData | null>(null);
  const [granted, setGranted] = useState<Set<Capability>>(new Set());
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    fetchPermissions()
      .then((loaded) => {
        setData(loaded);
        setGranted(
          new Set(loaded.capabilities.filter((row) => row.enabled).map((row) => row.capability)),
        );
      })
      .catch((caught: unknown) =>
        setLoadError(
          caught instanceof Error ? caught.message : "Could not load permissions.",
        ),
      );
  }, []);

  // The saved set, for comparison — so the Guardar button can tell the
  // supervisor whether anything is actually pending.
  const savedSet = useMemo(
    () => new Set(data?.capabilities.filter((row) => row.enabled).map((row) => row.capability)),
    [data],
  );

  const isDirty =
    granted.size !== savedSet.size || [...granted].some((capability) => !savedSet.has(capability));

  const toggle = (capability: Capability) => {
    setSavedAt(null);
    setGranted((current) => {
      const next = new Set(current);
      if (next.has(capability)) {
        next.delete(capability);
      } else {
        next.add(capability);
      }
      return next;
    });
  };

  const handleSave = async () => {
    setSaveError(null);
    setSaving(true);

    try {
      const result = await savePermissions([...granted]);

      setData((current) =>
        current
          ? {
              ...current,
              capabilities: current.capabilities.map((row) => ({
                ...row,
                enabled: result.capabilities.includes(row.capability),
              })),
            }
          : current,
      );
      setSavedAt(Date.now());
      onSaved();
    } catch (caught) {
      setSaveError(caught instanceof Error ? caught.message : "Could not save the changes.");
    } finally {
      setSaving(false);
    }
  };

  if (loadError) {
    return (
      <section className="panel active">
        <div className="card">
          <p className="form-error">{loadError}</p>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="panel active">
        <div className="card">
          <p className="state-message">Loading permissions…</p>
        </div>
      </section>
    );
  }

  const offered = new Set(data.capabilities.map((row) => row.capability));

  /*
   * Anything the server offers that the list above has never heard of.
   *
   * `GROUPS` is written by hand, and the failure it invites is silent: add a
   * capability to the server and forget the entry here, and the switch simply
   * does not exist. Nobody sees a gap — they see a complete-looking page — and
   * the new power stays permanently off for the associate while appearing to
   * nobody as a decision. That is the same class of bug as a permission that
   * looks granted and is not.
   *
   * So an undescribed capability is shown rather than dropped. It reads badly
   * on purpose — a raw `payment:edit` next to a plea for a proper label is
   * exactly the nudge needed — but the supervisor can still grant it, and it
   * cannot go missing.
   */
  const described = new Set(GROUPS.flatMap((group) => group.items.map((item) => item.capability)));
  const undescribed = data.capabilities.filter((row) => !described.has(row.capability));

  const groups =
    undescribed.length === 0
      ? GROUPS
      : [
          ...GROUPS,
          {
            title: "Other permissions",
            description:
              "Permissions provided by the server that this screen does not describe yet. " +
              "They work normally but need a display name.",
            items: undescribed.map((row) => ({
              capability: row.capability,
              label: row.capability,
              hint: undefined,
            })),
          },
        ];

  return (
    <section className="panel active">
      <div className="card permissions-intro">
        <h3>What can an {ROLE_LABELS.staff.toLowerCase()} do?</h3>
        <p>
          These settings apply to <strong>all associate accounts</strong>. Changes take effect
          immediately, even if an associate already has the app open, and are recorded in the
          activity history with your name.
        </p>
      </div>

      {groups.map((group) => {
        const items = group.items.filter((item) => offered.has(item.capability));

        if (items.length === 0) {
          return null;
        }

        return (
          <div key={group.title} className="card permission-group">
            <header className="permission-group-head">
              <h3>{group.title}</h3>
              <p className="field-hint">{group.description}</p>
            </header>

            <ul className="permission-list">
              {items.map((item) => {
                const isOn = granted.has(item.capability);

                return (
                  <li key={item.capability}>
                    <label className="permission-row">
                      <input
                        type="checkbox"
                        className="permission-switch"
                        checked={isOn}
                        onChange={() => toggle(item.capability)}
                      />
                      <span className="permission-text">
                        <span className="permission-label">{item.label}</span>
                        {item.hint && <span className="field-hint">{item.hint}</span>}
                      </span>
                      <span className={isOn ? "stamp success" : "stamp neutral"}>
                        {isOn ? "Allowed" : "Blocked"}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <div className="card permission-locked">
        <h3>Supervisor-only permissions</h3>
        <p className="field-hint">
          Managing users and editing permissions cannot be delegated. If associates could edit
          permissions, they could grant themselves every other permission — including the one
          needed to remove it.
        </p>
      </div>

      <div className="permission-actions">
        {saveError && <p className="form-error">{saveError}</p>}
        {savedAt !== null && !isDirty && <p className="field-hint">Changes saved.</p>}
        <button
          type="button"
          className="btn-primary"
          disabled={!isDirty || isSaving}
          onClick={() => void handleSave()}
        >
          {isSaving ? "Saving…" : "Save permissions"}
        </button>
      </div>
    </section>
  );
}
