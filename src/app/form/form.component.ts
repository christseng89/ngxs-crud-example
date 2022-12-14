import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";

import { Select, Store } from "@ngxs/store";

import { TodoState } from "../states/todo.state";
import { AddTodo, SetSelectedTodo, UpdateTodo } from "../actions/todo.action";
import { Todo } from "../models/Todo";

@Component({
  selector: "app-form",
  templateUrl: "./form.component.html",
  styleUrls: ["./form.component.scss"],
})
export class FormComponent implements OnInit, OnDestroy {
  @Select(TodoState.getSelectedTodo) selectedTodo: Observable<Todo>;
  todoForm: UntypedFormGroup;
  editTodo = false;
  private formSubscription: Subscription = new Subscription();

  constructor(
    private fb: UntypedFormBuilder,
    private store: Store,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.formSubscription.add(
      this.selectedTodo.subscribe((todo) => {
        if (todo) {
          this.todoForm.patchValue({
            id: todo.id,
            userId: todo.userId,
            title: todo.title,
          });
          this.editTodo = true;
        } else {
          this.editTodo = false;
        }
      })
    );
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  createForm() {
    this.todoForm = this.fb.group({
      id: [""],
      userId: ["", Validators.required],
      title: ["", Validators.required],
    });
  }

  onSubmit() {
    if (this.editTodo) {
      this.formSubscription.add(
        this.store
          .dispatch(new UpdateTodo(this.todoForm.value, this.todoForm.value.id))
          .subscribe(() => {
            this.clearForm();
          })
      );
    } else {
      this.formSubscription.add(
        this.store
          // Carridge return
          .dispatch(new AddTodo(this.todoForm.value))
          .subscribe(() => {
            this.clearForm();
          })
      );
    }
  }

  clearForm() {
    this.todoForm.reset();
    this.store.dispatch(new SetSelectedTodo(null));
  }
}
